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

const makePaymentSuccessForTip = async (transactionId: string) => {
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

    await NormalUser.findByIdAndUpdate(
      tip.user,
      { $inc: { totalPoint: tip.point } },
      { new: true, runValidators: true, session },
    );

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
const getAllTipsFromDB = async () => {
  const result = await Tip.find();
  return result;
};

// Get all tips for a specific user
const getUserTipsFromDB = async (userId: string) => {
  const result = await Tip.find({ user: userId });
  return result;
};

// Get a single tip by ID
const getSingleTipFromDB = async (tipId: string) => {
  const tip = await Tip.findById(tipId);

  if (!tip) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tip not found');
  }

  return tip;
};

const TipServices = {
  createTipIntoDB,
  getAllTipsFromDB,
  getUserTipsFromDB,
  getSingleTipFromDB,
  makePaymentSuccessForTip,
};

export default TipServices;
