/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from 'jsonwebtoken';
import { ITransaction } from '../transaction/transaction.interface';
import { ENUM_PAYMENT_BY } from '../../utilities/enum';
import Stripe from 'stripe';
import config from '../../config';
import paypal from 'paypal-rest-sdk';
import Transaction from '../transaction/transaction.model';
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
    entityType: 'User',
    transactionId: paymentIntent.id,
  });

  return {
    clientSecret: paymentIntent.client_secret,
  };
};

// deposit by paypal
const depositWithPaypal = async (user: JwtPayload, payload: ITransaction) => {
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

  await Transaction.create({
    ...payload,
    entityId: user.profileId,
    entityType: 'User',
    transactionId: payment?.paymentId,
  });
  return {
    approvalUrl: payment.approvalUrl,
  };
};

const depositServices = {
  depositAmount,
};

export default depositServices;
