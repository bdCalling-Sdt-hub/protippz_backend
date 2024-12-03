/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Tip from './tip.model';
import { ITip } from './tip.interface';
import NormalUser from '../normalUser/normalUser.model';
import mongoose from 'mongoose';
import { ENUM_PAYMENT_STATUS, ENUM_TIP_BY } from '../../utilities/enum';
import Stripe from 'stripe';
import config from '../../config';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);
import paypal from 'paypal-rest-sdk';
import Team from '../team/team.model';
import Player from '../player/player.model';
import QueryBuilder from '../../builder/QueryBuilder';
import cron from 'node-cron';
import Notification from '../notification/notification.model';

interface PayPalLink {
  href: string;
  rel: string;
  method: string;
}

interface PayPalPayment {
  id: string;
  links: PayPalLink[];
}
// PayPal configuration
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
  // const result = await Tip.create({...payload,user:userId});
  // return result;
};

// tip by account balance---------------------------------

const tipByProfileBalance = async (userId: string, payload: ITip) => {
  const normalUser = await NormalUser.findById(userId);
  if (!normalUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (normalUser.totalAmount < payload.amount) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You don't have enough amount in you account",
    );
  }
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const totalPoint = Math.ceil(payload.amount * 10);
    payload.point = totalPoint;
    payload.paymentStatus = ENUM_PAYMENT_STATUS.SUCCESS;

    const result = await Tip.create([{ ...payload, user: userId }], {
      session,
    });

    await NormalUser.findByIdAndUpdate(
      userId,
      { $inc: { totalAmount: -payload.amount, totalPoint: totalPoint } },
      { session },
    );

    // Determine whether to update a Team or Player
    if (payload.entityType === 'Team') {
      await Team.findByIdAndUpdate(
        payload.entityId,
        { $inc: { totalTips: payload.amount, dueAmount: payload.amount } },
        { session },
      );
    } else if (payload.entityType === 'Player') {
      await Player.findByIdAndUpdate(
        payload.entityId,
        { $inc: { totalTips: payload.amount, dueAmount: payload.amount } },
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    return result[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
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
  // if (user?.totalAmount < payload.amount) {
  //   throw new AppError(httpStatus.BAD_REQUEST, "You don't have enough amount");
  // }

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
  // if (user?.totalAmount < payload.amount) {
  //   throw new AppError(httpStatus.BAD_REQUEST, "You don't have enough amount");
  // }

  const totalPoint = Math.ceil(payload.amount * 10);
  payload.point = totalPoint;
  payload.paymentStatus = ENUM_PAYMENT_STATUS.PENDING;
  const create_payment_json = {
    intent: 'authorize', // Authorization rather than a sale
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

    const updatedUser = await NormalUser.findByIdAndUpdate(
      tip.user,
      { $inc: { totalPoint: tip.point } },
      { new: true, runValidators: true, session },
    );

    const notificationData = {
      title: `Successfully tip sent`,
      message: `Successfully tip send to ${tip.entityType} and you got ${tip.point} points`,
      receiver: updatedUser?._id,
    };

    await Notification.create(notificationData);

    // Determine whether to update a Team or Player
    if (updatedTip?.entityType === 'Team') {
      await Team.findByIdAndUpdate(
        updatedTip?.entityId,
        {
          $inc: { totalTips: updatedTip.amount, dueAmount: updatedTip.amount },
        },
        { session },
      );
    } else if (updatedTip?.entityType === 'Player') {
      await Player.findByIdAndUpdate(
        updatedTip.entityId,
        {
          $inc: { totalTips: updatedTip.amount, dueAmount: updatedTip.amount },
        },
        { session },
      );
    }

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
  const payment = await executePaypalPayment(paymentId, execute_payment_json);
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

    const updatedUser = await NormalUser.findByIdAndUpdate(
      tip.user,
      { $inc: { totalPoint: tip.point } },
      { new: true, runValidators: true, session },
    );
    const notificationData = {
      title: `Successfully tip sent`,
      message: `Successfully tip send to ${tip.entityType} and you got ${tip.point} points`,
      receiver: updatedUser?._id,
    };

    await Notification.create(notificationData);

    // Determine whether to update a Team or Player
    if (updatedTip?.entityType === 'Team') {
      await Team.findByIdAndUpdate(
        updatedTip?.entityId,
        {
          $inc: { totalTips: updatedTip.amount, dueAmount: updatedTip.amount },
        },
        { session },
      );
    } else if (updatedTip?.entityType === 'Player') {
      await Player.findByIdAndUpdate(
        updatedTip.entityId,
        {
          $inc: { totalTips: updatedTip.amount, dueAmount: updatedTip.amount },
        },
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    return updatedTip;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Get all tips

// const getAllTipsFromDB = async (query: Record<string, any>) => {
//   const tipQuery = new QueryBuilder(
//     Tip.find({ paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS }),
//     query,
//   )
//     .search(['name'])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const pipeline = [
//     {
//       $match: tipQuery.modelQuery.getFilter(),
//     },
//     {
//       $lookup: {
//         from: 'normalusers',
//         let: { userId: '$user' },
//         pipeline: [
//           { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
//           { $project: { name: 1, email: 1, profile_image: 1 } }, // Include only required fields
//         ],
//         as: 'user',
//       },
//     },
//     {
//       $unwind: '$user',
//     },
//     {
//       $lookup: {
//         from: 'teams',
//         localField: 'entityId',
//         foreignField: '_id',
//         as: 'teamEntity',
//       },
//     },
//     {
//       $lookup: {
//         from: 'players',
//         localField: 'entityId',
//         foreignField: '_id',
//         as: 'playerEntity',
//       },
//     },
//     {
//       $addFields: {
//         entity: {
//           $cond: {
//             if: { $eq: ['$entityType', 'Team'] },
//             then: {
//               name: { $arrayElemAt: ['$teamEntity.name', 0] },
//               team_logo: { $arrayElemAt: ['$teamEntity.team_logo', 0] },
//             },
//             else: {
//               name: { $arrayElemAt: ['$playerEntity.name', 0] },
//               position: { $arrayElemAt: ['$playerEntity.position', 0] },
//               player_image: { $arrayElemAt: ['$playerEntity.player_image', 0] },
//             },
//           },
//         },
//       },
//     },
//     {
//       $project: {
//         teamEntity: 0,
//         playerEntity: 0,
//       },
//     },
//   ];

//   // Execute the aggregation pipeline
//   const result = await Tip.aggregate(pipeline);

//   const meta = await tipQuery.countTotal(); // Count total documents for pagination
//   return {
//     meta,
//     result,
//   };
// };
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
  userId: string,
  query: Record<string, any>,
) => {
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
              player_image: { $arrayElemAt: ['$playerEntity.player_image', 0] },
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

const TipServices = {
  createTipIntoDB,
  getAllTipsFromDB,
  getUserTipsFromDB,
  getSingleTipFromDB,
  paymentSuccessWithStripe,
  executePaymentWithPaypal,
};

export default TipServices;
