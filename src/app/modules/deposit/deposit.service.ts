/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from 'jsonwebtoken';
import { ITransaction } from '../transaction/transaction.interface';
import {
  ENUM_PAYMENT_BY,
  ENUM_TRANSACTION_STATUS,
  ENUM_TRANSACTION_TYPE,
} from '../../utilities/enum';
import Stripe from 'stripe';
import config from '../../config';
import paypal from 'paypal-rest-sdk';
import Transaction from '../transaction/transaction.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import NormalUser from '../normalUser/normalUser.model';
import mongoose from 'mongoose';
import Notification from '../notification/notification.model';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);

paypal.configure({
  mode: process.env.PAYPAL_MODE as string,
  client_id: process.env.PAYPAL_CLIENT_ID as string,
  client_secret: process.env.PAYPAL_CLIENT_SECRET as string,
});

const depositAmount = async (user: JwtPayload, payload: ITransaction) => {
  let result;
  if (payload.paymentBy === ENUM_PAYMENT_BY.CREDIT_CARD) {
    result = await depositWithCreditCard(user, payload);
  } else if (payload.paymentBy === ENUM_PAYMENT_BY.PAYPAL) {
    result = await depositWithPaypal(user, payload);
  }

  return result;
};

// deposit with credit card
const depositWithCreditCard = async (
  user: JwtPayload,
  payload: ITransaction,
) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number((payload.amount * 100).toFixed(2)),
    currency: 'usd',
    payment_method_types: ['card'],
  });

  await Transaction.create({
    ...payload,
    entityId: user.profileId,
    entityType: 'NormalUser',
    transactionId: paymentIntent.id,
    transactionType: ENUM_TRANSACTION_TYPE.DEPOSIT,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    // transactionId: paymentIntent.id,
  };
};

// deposit by paypal
const depositWithPaypal = async (user: JwtPayload, payload: ITransaction) => {
  const create_payment_json = {
    intent: 'authorize', // Authorization rather than a sale
    payer: { payment_method: 'paypal' },
    redirect_urls: {
      return_url: process.env.PAYPAL_DEPOSIT_SUCCESS_URL,
      cancel_url: process.env.PAYPAL_DEPOSIT_CANCEL_URL,
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

  console.log('payment', payment);

  await Transaction.create({
    ...payload,
    entityId: user.profileId,
    entityType: 'NormalUser',
    transactionId: payment?.paymentId,
    transactionType: ENUM_TRANSACTION_TYPE.DEPOSIT,
  });
  return {
    approvalUrl: payment.approvalUrl,
  };
};

const executeStripeDeposit = async (transactionId: string) => {
  const session = await Transaction.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.findOne(
      { transactionId: transactionId, status: ENUM_TRANSACTION_STATUS.PENDING },
      null,
      { session },
    );

    if (!transaction) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'No pending deposit intent found.',
      );
    }

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { transactionId: transactionId, status: ENUM_TRANSACTION_STATUS.PENDING },
      { status: ENUM_TRANSACTION_STATUS.SUCCESS },
      { new: true, runValidators: true, session },
    );

    if (!updatedTransaction) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update transaction status.',
      );
    }

    const updatedUser = await NormalUser.findByIdAndUpdate(
      updatedTransaction.entityId,
      { $inc: { totalAmount: updatedTransaction.amount } },
      { new: true, runValidators: true, session },
    );

    const notificationData = {
      title: 'Successfully deposit amount',
      message:
        'Your deposit is successful with credit card . Check your account balance',
      receiver: updatedUser?._id,
    };

    await Notification.create(notificationData);

    if (!updatedUser) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update user balance.',
      );
    }

    await session.commitTransaction();
    session.endSession();

    return updatedTransaction;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// execute paypal deposit

const executePaypalDeposit = async (paymentId: string, payerId: string) => {
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
    const transaction = await Transaction.findOne({
      transactionId: payment.id,
      status: ENUM_TRANSACTION_STATUS.PENDING,
    }).session(session);
    if (!transaction) {
      throw new AppError(httpStatus.NOT_FOUND, "You don't have deposit intent");
    }

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { transactionId: payment.id },
      { status: ENUM_TRANSACTION_STATUS.SUCCESS },
      { new: true, runValidators: true, session },
    );

    const updatedUser = await NormalUser.findByIdAndUpdate(
      transaction.entityId,
      { $inc: { totalAmount: transaction.amount } },
      { new: true, runValidators: true, session },
    );
    if (!updatedUser) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'User not found during deposit update.',
      );
    }

    const notificationData = {
      title: 'Successfully deposit amount',
      message:
        'Your deposit is successful with credit card . Check your account balance',
      receiver: updatedUser?._id,
    };

    await Notification.create(notificationData);

    await session.commitTransaction();
    session.endSession();

    return updatedTransaction;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const executeDepositPaymentWithApp = async (
  profileId: string,
  paymentId: string,
  payerId: string,
) => {
  console.log('user,payerId,paymentId', profileId, paymentId, payerId);
  try {
    // Use the payment.get method to retrieve payment details
    const payment = await new Promise<any>((resolve, reject) => {
      paypal.payment.get(paymentId, (error, payment) => {
        if (error) {
          reject(error);
        } else {
          resolve(payment);
        }
      });
    });

    // Verify if the payer_id matches and the payment status is 'approved'
    if (
      payment.payer.payer_info.payer_id === payerId &&
      payment.state === 'approved'
    ) {
      const isExistTransaction = await Transaction.findOne({
        transactionId: payment.id,
      });
      if (isExistTransaction) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'This payment already execute',
        );
      }

      await NormalUser.findByIdAndUpdate(
        profileId,
        {
          $inc: { totalAmount: payment.transactions[0].amount.total },
        },
        { new: true, runValidators: true },
      );
      // Payment is successful
      const transaction = await Transaction.create({
        entityId: profileId,
        entityType: 'NormalUser',
        amount: payment.transactions[0].amount.total,
        transactionId: payment?.id,
        paymentBy: ENUM_PAYMENT_BY.PAYPAL,
        status: ENUM_TRANSACTION_STATUS.SUCCESS,
        transactionType: ENUM_TRANSACTION_TYPE.DEPOSIT,
      });
      const notificationData = {
        title: 'Successfully deposit amount',
        message:
          'Your deposit is successful with paypal. Check your account balance',
        receiver: profileId,
      };
      await Notification.create(notificationData);
      return transaction;
    } else {
      // Payment failed or was not approved
      throw new Error('Payment verification failed');
    }
  } catch (err: any) {
    console.error('Error verifying PayPal payment:', err);
    return { status: 'error', message: err.message };
  }
};

const depositServices = {
  depositAmount,
  executeStripeDeposit,
  executePaypalDeposit,
  executeDepositPaymentWithApp,
};

export default depositServices;
