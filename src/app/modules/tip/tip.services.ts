/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Tip from './tip.model';
import { ITip } from './tip.interface';
import NormalUser from '../normalUser/normalUser.model';
import mongoose from 'mongoose';
import {
  ENUM_PAYMENT_BY,
  ENUM_PAYMENT_STATUS,
  ENUM_TIP_BY,
  ENUM_TRANSACTION_TYPE,
} from '../../utilities/enum';
import Stripe from 'stripe';
import config from '../../config';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);
import paypal from 'paypal-rest-sdk';
import Team from '../team/team.model';
import Player from '../player/player.model';
import QueryBuilder from '../../builder/QueryBuilder';
import cron from 'node-cron';
import Notification from '../notification/notification.model';
import Transaction from '../transaction/transaction.model';
import { pointPerAmountTip } from '../../constant';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLE } from '../user/user.constant';

interface PayPalLink {
  href: string;
  rel: string;
  method: string;
}

// PayPal configuration-----------------------------------
paypal.configure({
  mode: process.env.PAYPAL_MODE as string,
  client_id: process.env.PAYPAL_CLIENT_ID as string,
  client_secret: process.env.PAYPAL_CLIENT_SECRET as string,
});

const createTipIntoDB = async (userId: string, payload: ITip) => {
  let result;
  if (payload.tipBy === ENUM_TIP_BY.PROFILE_BALANCE) {
    result = await tipByProfileBalance(userId, payload);
  } else if (payload.tipBy === ENUM_TIP_BY.CREDIT_CARD) {
    result = await tipByCreditCard(userId, payload);
  } else if (payload.tipBy === ENUM_TIP_BY.PAYPAL) {
    result = await tipByPaypal(userId, payload);
  }

  return result;
};

// tip by account balance---------------------------------

// const tipByProfileBalance = async (userId: string, payload: ITip) => {
//   const normalUser = await NormalUser.findById(userId);
//   if (!normalUser) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found');
//   }
//   if (normalUser.totalAmount < payload.amount) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "You don't have enough amount in you account",
//     );
//   }
//   if (payload.entityType === 'Team') {
//     const team = await Team.findById(payload.entityId);
//     if (!team) {
//       throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
//     }
//   } else if (payload.entityType === 'Player') {
//     const player = await Player.findById(payload.entityId);
//     if (!player) {
//       throw new AppError(httpStatus.NOT_FOUND, 'Player not found');
//     }
//   }
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const totalPoint = Math.ceil(payload.amount * 10);
//     payload.point = totalPoint;
//     payload.paymentStatus = ENUM_PAYMENT_STATUS.SUCCESS;

//     const result = await Tip.create([{ ...payload, user: userId }], {
//       session,
//     });

//     const updatedUser = await NormalUser.findByIdAndUpdate(
//       userId,
//       {
//         $inc: {
//           totalAmount: -payload.amount,
//           totalPoint: totalPoint,
//           totalTipSent: payload.amount,
//         },
//       },
//       { session },
//     );

//     // Determine whether to update a Team or Player
//     // const tipAmountAfterCharge = payload.amount - (payload.amount * 10) / 100;
//     const tipAmountAfterCharge =
//       payload.amount - (payload.amount * 10) / 100 - 0.3;
//     if (payload.entityType === 'Team') {
//       await Team.findByIdAndUpdate(
//         payload.entityId,
//         {
//           $inc: {
//             totalTips: tipAmountAfterCharge,
//             dueAmount: tipAmountAfterCharge,
//           },
//         },
//         { session },
//       );
//     } else if (payload.entityType === 'Player') {
//       await Player.findByIdAndUpdate(
//         payload.entityId,
//         {
//           $inc: {
//             totalTips: tipAmountAfterCharge,
//             dueAmount: tipAmountAfterCharge,
//           },
//         },
//         { session },
//       );
//     }
//     await Tip.create({
//       ...payload,
//       user: userId,
//     });

//     await session.commitTransaction();
//     session.endSession();

//     let playerTeamInfo;
//     if (result[0].entityType === 'Player') {
//       playerTeamInfo = await Player.findById(result[0].entityId);
//     } else if (result[0].entityType === 'Team') {
//       playerTeamInfo = await Team.findById(result[0].entityId);
//     }

//     const notificationData = {
//       title: `Tip sent successfully.`,
//       message: `You have successfully sent a tip to ${playerTeamInfo?.name} and earned ${result[0].point} points.`,
//       receiver: updatedUser?._id,
//     };
//     await Notification.create(notificationData);
//     return result[0];
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();

//     throw error;
//   }
// };

const tipByProfileBalance = async (userId: string, payload: ITip) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  // Find the normal user to validate balance and account
  const normalUser = await NormalUser.findById(userId);
  if (!normalUser) {
    throw new Error('User not found');
  }

  // Check if user has enough balance
  if (normalUser.totalAmount < payload.amount) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You don't have enough amount in your account",
    );
  }

  // Check if the entity is a Team or Player and ensure it exists
  let entity;
  if (payload.entityType === 'Team') {
    entity = await Team.findById(payload.entityId);
    if (!entity) {
      throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
    }
  } else if (payload.entityType === 'Player') {
    entity = await Player.findById(payload.entityId);
    if (!entity) {
      throw new AppError(httpStatus.NOT_FOUND, 'Player not found');
    }
  }

  // Calculate total points for the tip
  const totalPoint = Math.ceil(payload.amount * 10);
  payload.point = totalPoint;
  payload.paymentStatus = ENUM_PAYMENT_STATUS.SUCCESS;

  // Create the tip in the database
  const result = await Tip.create([{ ...payload, user: userId }], {
    session,
  });

  // Update the user account (decrease balance and increase points)
  const updatedUser = await NormalUser.findByIdAndUpdate(
    userId,
    {
      $inc: {
        totalAmount: -payload.amount, // Deduct the amount
        totalPoint: totalPoint, // Add the points
        totalTipSent: payload.amount, // Track the total tip sent
      },
    },
    { new: true, session }, // `new: true` to get the updated document
  );

  if (!updatedUser) {
    throw new AppError(httpStatus.FAILED_DEPENDENCY, 'Failed to update user');
  }

  // Calculate tip amount after charge (10% + $0.30 fee)
  const tipAmountAfterCharge = payload.amount - (payload.amount * 10) / 100;

  // Update the respective Team or Player
  if (payload.entityType === 'Team') {
    await Team.findByIdAndUpdate(
      payload.entityId,
      {
        $inc: {
          totalTips: tipAmountAfterCharge,
          dueAmount: tipAmountAfterCharge,
        },
      },
      { session },
    );
  } else if (payload.entityType === 'Player') {
    await Player.findByIdAndUpdate(
      payload.entityId,
      {
        $inc: {
          totalTips: tipAmountAfterCharge,
          dueAmount: tipAmountAfterCharge,
        },
      },
      { session },
    );
  }

  // Create a notification for the user
  let playerTeamInfo;
  if (result[0].entityType === 'Player') {
    playerTeamInfo = await Player.findById(result[0].entityId);
  } else if (result[0].entityType === 'Team') {
    playerTeamInfo = await Team.findById(result[0].entityId);
  }

  if (!playerTeamInfo) {
    throw new Error('Unable to find entity for notification');
  }

  const notificationData = {
    title: 'Tip sent successfully.',
    message: `You have successfully sent a tip to ${playerTeamInfo.name} and earned ${result[0].point} points.`,
    receiver: updatedUser._id,
  };

  await Notification.create(notificationData);

  // Commit the transaction
  await session.commitTransaction();
  session.endSession();

  return result[0];
};

const tipByCreditCard = async (userId: string, payload: ITip) => {
  if (payload.entityType === 'Team') {
    const team = await Team.findById(payload.entityId);
    if (!team) {
      throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
    }
  } else if (payload.entityType === 'Player') {
    const player = await Player.findById(payload.entityId);
    if (!player) {
      throw new AppError(httpStatus.NOT_FOUND, 'Player not found');
    }
  }

  const user = await NormalUser.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const totalPoint = Math.ceil(payload.amount * 10);
  payload.point = totalPoint;
  payload.paymentStatus = ENUM_PAYMENT_STATUS.PENDING;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number((payload.amount * 100).toFixed(2)),
    currency: 'usd',
    payment_method_types: ['card'],
  });

  await Tip.create({
    ...payload,
    user: userId,
    transactionId: paymentIntent.id,
  });
  return {
    clientSecret: paymentIntent.client_secret,
    // transactionId: paymentIntent.id,
  };
};

// tip by paypal

const tipByPaypal = async (userId: string, payload: ITip) => {
  if (payload.entityType === 'Team') {
    const team = await Team.findById(payload.entityId);
    if (!team) {
      throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
    }
  } else if (payload.entityType === 'Player') {
    const player = await Player.findById(payload.entityId);
    if (!player) {
      throw new AppError(httpStatus.NOT_FOUND, 'Player not found');
    }
  }

  const user = await NormalUser.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const totalPoint = Math.ceil(payload.amount * 10);
  payload.point = totalPoint;
  payload.paymentStatus = ENUM_PAYMENT_STATUS.PENDING;
  const create_payment_json = {
    intent: 'authorize',
    payer: { payment_method: 'paypal' },
    redirect_urls: {
      return_url: process.env.PAYPAL_SUCCESS_URL,
      cancel_url: process.env.PAYPAL_CANCEL_URL,
    },
    transactions: [
      {
        amount: { currency: 'USD', total: Number(payload.amount).toFixed(2) },
        description: `Tip for ${payload.entityType}`,
        item_list: {
          items: [
            {
              name: 'Tip',
              price: Number(payload.amount).toFixed(2),
              currency: 'USD',
              quantity: 1,
            },
          ],
        },
      },
    ],
  };

  const payment = await new Promise<{ approvalUrl: string; paymentId: string }>(
    (resolve, reject) => {
      paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
          reject(error);
        } else {
          const approvalUrl =
            (payment as any)?.links?.find(
              (link: any) => link?.rel === 'approval_url',
            )?.href ?? '';
          const paymentId = (payment as any).id ?? '';

          resolve({ approvalUrl, paymentId });
        }
      });
    },
  );

  await Tip.create({
    ...payload,
    user: userId,
    transactionId: payment?.paymentId,
  });
  return {
    approvalUrl: payment.approvalUrl,
  };
};

// make payment success for tip

const paymentSuccessWithStripe = async (transactionId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tip = await Tip.findOne({ transactionId: transactionId }).session(
      session,
    );
    if (!tip) {
      throw new AppError(httpStatus.NOT_FOUND, 'Tip not found');
    }

    const updatedTip = await Tip.findOneAndUpdate(
      { transactionId: transactionId },
      { paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS },
      { new: true, runValidators: true, session },
    );

    if (!updatedTip) {
      throw new AppError(httpStatus.SERVICE_UNAVAILABLE, 'Server unavailable');
    }
    const updatedUser = await NormalUser.findByIdAndUpdate(
      tip.user,
      { $inc: { totalPoint: tip.point, totalTipSent: tip.amount } },
      { new: true, runValidators: true, session },
    );
    let playerTeamInfo;
    if (tip.entityType === 'Player') {
      playerTeamInfo = await Player.findById(tip.entityId);
    } else if (tip.entityType === 'Team') {
      playerTeamInfo = await Team.findById(tip.entityId);
    }

    const notificationData = {
      title: `Tip sent successfully.`,
      message: `You have successfully sent a tip to ${playerTeamInfo?.name} and earned ${tip.point} points.`,
      receiver: updatedUser?._id,
    };

    await Notification.create(notificationData);
    // Determine whether to update a Team or Player
    // const tipAmountAfterCharge =
    //   updatedTip.amount - (updatedTip.amount * 10) / 100;
    const tipAmountAfterCharge =
      updatedTip.amount - (updatedTip.amount * 10) / 100 - 0.3;
    if (updatedTip?.entityType === 'Team') {
      await Team.findByIdAndUpdate(
        updatedTip?.entityId,
        {
          $inc: {
            totalTips: tipAmountAfterCharge,
            dueAmount: tipAmountAfterCharge,
          },
        },
        { session },
      );
    } else if (updatedTip?.entityType === 'Player') {
      await Player.findByIdAndUpdate(
        updatedTip.entityId,
        {
          $inc: {
            totalTips: tipAmountAfterCharge,
            dueAmount: tipAmountAfterCharge,
          },
        },
        { session },
      );
    }

    await Transaction.create({
      entityId: tip.user,
      entityType: 'NormalUser',
      transactionId: transactionId,
      transactionType: ENUM_TRANSACTION_TYPE.TIP,
      paymentBy: ENUM_PAYMENT_BY.CREDIT_CARD,
      status: ENUM_PAYMENT_STATUS.SUCCESS,
      amount: tip.amount,
    });
    await session.commitTransaction();
    session.endSession();

    return updatedTip;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// execute payment with paypal

const executePaymentWithPaypal = async (paymentId: string, payerId: string) => {
  const execute_payment_json = { payer_id: payerId };
  const executePaypalPayment = (paymentId: string, execute_payment_json: any) =>
    new Promise((resolve, reject) => {
      paypal.payment.execute(
        paymentId,
        execute_payment_json,
        (error, payment) => {
          if (error) {
            reject(error);
          } else {
            resolve(payment);
          }
        },
      );
    });

  // Await the PayPal payment execution
  const payment: any = await executePaypalPayment(
    paymentId,
    execute_payment_json,
  );
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tip = await Tip.findOne({ transactionId: payment.id }).session(
      session,
    );
    if (!tip) {
      throw new AppError(httpStatus.NOT_FOUND, 'Tip not found');
    }

    const updatedTip = await Tip.findOneAndUpdate(
      { transactionId: payment.id },
      { paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS },
      { new: true, runValidators: true, session },
    );
    if (!updatedTip) {
      throw new AppError(httpStatus.SERVICE_UNAVAILABLE, 'Server unavailable');
    }
    const updatedUser = await NormalUser.findByIdAndUpdate(
      tip.user,
      { $inc: { totalPoint: tip.point, totalTipSent: tip.amount } },
      { new: true, runValidators: true, session },
    );
    let playerTeamInfo;
    if (tip.entityType === 'Player') {
      playerTeamInfo = await Player.findById(tip.entityId);
    } else if (tip.entityType === 'Team') {
      playerTeamInfo = await Team.findById(tip.entityId);
    }

    const notificationData = {
      title: `Successfully tip sent`,
      message: `You have successfully sent a tip to ${playerTeamInfo?.name} and earned ${tip.point} points.`,
      receiver: updatedUser?._id,
    };

    await Notification.create(notificationData);

    // Determine whether to update a Team or Player
    // const tipAmountAfterCharge =
    //   updatedTip.amount - (updatedTip.amount * 10) / 100;
    const tipAmountAfterCharge =
      updatedTip.amount - (updatedTip.amount * 10) / 100 - 0.3;
    if (updatedTip?.entityType === 'Team') {
      await Team.findByIdAndUpdate(
        updatedTip?.entityId,
        {
          $inc: {
            totalTips: tipAmountAfterCharge,
            dueAmount: tipAmountAfterCharge,
          },
        },
        { session },
      );
    } else if (updatedTip?.entityType === 'Player') {
      await Player.findByIdAndUpdate(
        updatedTip.entityId,
        {
          $inc: {
            totalTips: tipAmountAfterCharge,
            dueAmount: tipAmountAfterCharge,
          },
        },
        { session },
      );
    }

    await Transaction.create({
      entityId: tip.user,
      entityType: 'NormalUser',
      transactionId: payment?.id,
      transactionType: ENUM_TRANSACTION_TYPE.TIP,
      paymentBy: ENUM_PAYMENT_BY.PAYPAL,
      status: ENUM_PAYMENT_STATUS.SUCCESS,
      amount: updatedTip.amount,
    });

    await session.commitTransaction();
    session.endSession();

    return updatedTip;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// const executePaypalTipPaymentWithApp = async (
//   profileId: string,
//   paymentId: string,
//   payerId: string,
//   entityId: string,
//   entityType: 'Team' | 'Player',
// ) => {
//   if (entityType === 'Team') {
//     const team = await Team.findById(entityId);
//     if (!team) {
//       throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
//     }
//   } else if (entityType === 'Player') {
//     const player = await Player.findById(entityId);
//     if (!player) {
//       throw new AppError(httpStatus.NOT_FOUND, 'Player not found');
//     }
//   }
//   try {
//     // Use the payment.get method to retrieve payment details
//     const payment = await new Promise<any>((resolve, reject) => {
//       paypal.payment.get(paymentId, (error, payment) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve(payment);
//         }
//       });
//     });

//     // console.log('payment in tip', payment);

//     // Verify if the payer_id matches and the payment status is 'approved'
//     if (
//       payment.payer.payer_info.payer_id === payerId &&
//       payment.state === 'approved'
//     ) {
//       const isExistTransaction = await Tip.findOne({
//         transactionId: payment.id,
//       });
//       if (isExistTransaction) {
//         throw new AppError(
//           httpStatus.BAD_REQUEST,
//           'This payment already execute',
//         );
//       }
//       const createTip = await Tip.create({
//         user: profileId,
//         entityId: entityId,
//         entityType: entityType,
//         amount: payment.transactions[0].amount.total,
//         transactionId: paymentId,
//         paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
//         tipBy: ENUM_TIP_BY.PAYPAL,
//         point: payment.transactions[0].amount.total * pointPerAmountTip,
//       });
//       await NormalUser.findByIdAndUpdate(
//         profileId,
//         {
//           $inc: {
//             totalPoint:
//               payment.transactions[0].amount.total * pointPerAmountTip,
//             totalTipSent: payment.transactions[0].amount.total,
//           },
//         },
//         { new: true, runValidators: true },
//       );

//       // update player or team------------------
//       const tipAmountAfterCharge =
//         createTip.amount - (createTip.amount * 10) / 100;
//       if (createTip?.entityType === 'Team') {
//         await Team.findByIdAndUpdate(createTip?.entityId, {
//           $inc: {
//             totalTips: tipAmountAfterCharge,
//             dueAmount: tipAmountAfterCharge,
//           },
//         });
//       } else if (createTip?.entityType === 'Player') {
//         await Player.findByIdAndUpdate(createTip.entityId, {
//           $inc: {
//             totalTips: tipAmountAfterCharge,
//             dueAmount: tipAmountAfterCharge,
//           },
//         });
//       }
//       const notificationData = {
//         title: `Successfully tip sent`,
//         message: `Successfully tip send to ${createTip.entityType} and you got ${createTip.point} points`,
//         receiver: profileId,
//       };

//       await Notification.create(notificationData);
//       return createTip;
//     } else {
//       // Payment failed or was not approved
//       throw new AppError(httpStatus.BAD_REQUEST, 'Payment verification failed');
//     }
//   } catch (err) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Tip payment not successful');
//   }
// };

const executePaypalTipPaymentWithApp = async (
  profileId: string,
  paymentId: string,
  payerId: string,
  entityId: string,
  entityType: 'Team' | 'Player',
) => {
  try {
    // Check if entity exists
    if (entityType === 'Team') {
      const team = await Team.findById(entityId);
      if (!team) {
        throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
      }
    } else if (entityType === 'Player') {
      const player = await Player.findById(entityId);
      if (!player) {
        throw new AppError(httpStatus.NOT_FOUND, 'Player not found');
      }
    }

    // Retrieve PayPal payment details
    const payment = await new Promise<any>((resolve, reject) => {
      paypal.payment.get(paymentId, (error, payment) => {
        if (error) {
          return reject(
            new AppError(
              httpStatus.UNAUTHORIZED,
              `PayPal API Error: ${
                error.response?.error_description || error.message
              }`,
            ),
          );
        }
        resolve(payment);
      });
    });

    // Verify PayPal response
    if (
      payment.payer.payer_info.payer_id === payerId &&
      payment.state === 'approved'
    ) {
      const isExistTransaction = await Tip.findOne({
        transactionId: payment.id,
      });

      if (isExistTransaction) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'This payment has already been executed.',
        );
      }

      const tipAmount = parseFloat(payment.transactions[0].amount.total);
      const pointEarned = tipAmount * pointPerAmountTip;
      // const tipAmountAfterCharge = tipAmount - (tipAmount * 10) / 100;
      const tipAmountAfterCharge = tipAmount - (tipAmount * 10) / 100 - 0.3;

      // Create a Tip record
      const createTip = await Tip.create({
        user: profileId,
        entityId,
        entityType,
        amount: tipAmount,
        transactionId: paymentId,
        paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
        tipBy: ENUM_TIP_BY.PAYPAL,
        point: pointEarned,
      });

      // new work ---------

      await Transaction.create({
        entityId: profileId,
        entityType: 'NormalUser',
        transactionId: payment?.paymentId,
        transactionType: ENUM_TRANSACTION_TYPE.TIP,
        paymentBy: ENUM_PAYMENT_BY.PAYPAL,
        status: ENUM_PAYMENT_STATUS.SUCCESS,
        amount: tipAmount,
      });
      // Update user points and total tips sent
      await NormalUser.findByIdAndUpdate(
        profileId,
        {
          $inc: {
            totalPoint: pointEarned,
            totalTipSent: tipAmount,
          },
        },
        { new: true, runValidators: true },
      );

      // Update Team or Player's earnings
      if (entityType === 'Team') {
        await Team.findByIdAndUpdate(entityId, {
          $inc: {
            totalTips: tipAmountAfterCharge,
            dueAmount: tipAmountAfterCharge,
          },
        });
      } else if (entityType === 'Player') {
        await Player.findByIdAndUpdate(entityId, {
          $inc: {
            totalTips: tipAmountAfterCharge,
            dueAmount: tipAmountAfterCharge,
          },
        });
      }

      let playerTeamInfo;
      if (createTip.entityType === 'Player') {
        playerTeamInfo = await Player.findById(createTip.entityId);
      } else if (createTip.entityType === 'Team') {
        playerTeamInfo = await Team.findById(createTip.entityId);
      }

      // Send notification to user
      const notificationData = {
        title: `Tip Successfully Sent`,
        message: `You have successfully sent a tip to ${playerTeamInfo?.name} and earned ${createTip.point} points.`,
        receiver: profileId,
      };
      await Notification.create(notificationData);

      return createTip;
    } else {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Payment verification failed. Payment state is not approved.',
      );
    }
  } catch (err: any) {
    console.error('PayPal Tip Payment Error:', err);

    if (err.response?.httpStatusCode === 401) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'PayPal Authentication Error: Invalid Client ID or Secret.',
      );
    }

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Tip payment failed: ${err.message}`,
    );
  }
};

const getAllTipsFromDB = async (query: Record<string, any>) => {
  const { searchTerm, ...otherQueryParams } = query;

  const tipQuery = new QueryBuilder(
    Tip.find({ paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS }),
    otherQueryParams,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const pipeline = [
    {
      $match: tipQuery.modelQuery.getFilter(),
    },
    {
      $lookup: {
        from: 'normalusers',
        let: { userId: '$user' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
          { $project: { name: 1, email: 1, profile_image: 1 } },
        ],
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $lookup: {
        from: 'teams',
        localField: 'entityId',
        foreignField: '_id',
        as: 'teamEntity',
      },
    },
    {
      $lookup: {
        from: 'players',
        localField: 'entityId',
        foreignField: '_id',
        as: 'playerEntity',
      },
    },
    {
      $addFields: {
        entity: {
          $cond: {
            if: { $eq: ['$entityType', 'Team'] },
            then: {
              name: { $arrayElemAt: ['$teamEntity.name', 0] },
              team_logo: { $arrayElemAt: ['$teamEntity.team_logo', 0] },
            },
            else: {
              name: { $arrayElemAt: ['$playerEntity.name', 0] },
              position: { $arrayElemAt: ['$playerEntity.position', 0] },
              player_image: { $arrayElemAt: ['$playerEntity.player_image', 0] },
            },
          },
        },
      },
    },
    // Add this match stage if `searchTerm` exists in the query
    ...(searchTerm
      ? [
          {
            $match: {
              $or: [
                { 'entity.name': { $regex: searchTerm, $options: 'i' } },
                { 'user.name': { $regex: searchTerm, $options: 'i' } },
              ],
            },
          },
        ]
      : []),
    {
      $project: {
        teamEntity: 0,
        playerEntity: 0,
      },
    },
  ];

  // Execute the aggregation pipeline
  const result = await Tip.aggregate(pipeline);

  const meta = await tipQuery.countTotal(); // Count total documents for pagination
  return {
    meta,
    result,
  };
};

const getUserTipsFromDB = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {
  const userId = user.profileId;

  if (user?.role == USER_ROLE.user) {
    const tipQuery = new QueryBuilder(
      Tip.find({ user: userId, paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS }),
      query,
    )
      .search(['name'])
      .filter()
      .sort()
      .paginate()
      .fields();

    const pipeline = [
      {
        $match: tipQuery.modelQuery.getFilter(),
      },
      {
        $lookup: {
          from: 'normalusers',
          let: { userId: '$user' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
            { $project: { name: 1, email: 1, profile_image: 1 } }, // Include only required fields
          ],
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'entityId',
          foreignField: '_id',
          as: 'teamEntity',
        },
      },
      {
        $lookup: {
          from: 'players',
          localField: 'entityId',
          foreignField: '_id',
          as: 'playerEntity',
        },
      },
      {
        $addFields: {
          entity: {
            $cond: {
              if: { $eq: ['$entityType', 'Team'] },
              then: {
                name: { $arrayElemAt: ['$teamEntity.name', 0] },
                team_logo: { $arrayElemAt: ['$teamEntity.team_logo', 0] },
              },
              else: {
                name: { $arrayElemAt: ['$playerEntity.name', 0] },
                position: { $arrayElemAt: ['$playerEntity.position', 0] },
                player_image: {
                  $arrayElemAt: ['$playerEntity.player_image', 0],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          teamEntity: 0,
          playerEntity: 0,
        },
      },
    ];

    // Execute the aggregation pipeline
    const result = await Tip.aggregate(pipeline);

    const meta = await tipQuery.countTotal(); // Count total documents for pagination
    return {
      meta,
      result,
    };
  } else {
    const tipQuery = new QueryBuilder(
      Tip.find({ $or: [{ entityId: userId }, { entityId: userId }] }).populate({
        path: 'user',
        select: 'name profile_image',
      }),
      query,
    )
      .search(['name'])
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await tipQuery.countTotal();
    const result = await tipQuery.modelQuery;

    return {
      meta,
      result,
    };
  }
};

// Get a single tip by ID
const getSingleTipFromDB = async (tipId: string) => {
  const tip = await Tip.findById(tipId);

  if (!tip) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tip not found');
  }

  return tip;
};
// crone jobs
cron.schedule('*/30 * * * *', async () => {
  try {
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
    const result = await Tip.deleteMany({
      paymentStatus: ENUM_PAYMENT_STATUS.PENDING,
      createdAt: { $lt: twentyMinutesAgo },
    });
    console.log(
      `Deleted ${result.deletedCount} pending tips older than 20 minutes`,
    );
  } catch (error) {
    console.error('Error deleting old pending tips:', error);
  }
});

// try to profile balance tip

const TipServices = {
  createTipIntoDB,
  getAllTipsFromDB,
  getUserTipsFromDB,
  getSingleTipFromDB,
  paymentSuccessWithStripe,
  executePaymentWithPaypal,
  executePaypalTipPaymentWithApp,
};

export default TipServices;
