/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../user/user.model';
import Stripe from 'stripe';
import config from '../../config';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);
const linkBankAccount = async (userData: JwtPayload, payload: any) => {
  const { routingNumber, accountNumber } = payload;
  const user = await User.findById(userData.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Create an external bank account for ACH transfer
  const bankAccount = await stripe.accounts.createExternalAccount(
    user?.stripeCustomerId,
    {
      external_account: {
        object: 'bank_account',
        country: 'US', // Or use the user's country
        currency: 'usd', // Or use the currency you support
        routing_number: routingNumber,
        account_number: accountNumber,
      },
    },
  );
  await User.findByIdAndUpdate(
    userData.id,
    { bankAccountId: bankAccount.id },
    { new: true, runValidators: true },
  );

  return { bankAccountId: bankAccount.id };
};
const updateBankInfo = async (userData: JwtPayload, payload: any) => {
  const { routingNumber, accountNumber } = payload;
  const user = await User.findById(userData.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  // Create a new external bank account
  const newBankAccount = await stripe.accounts.createExternalAccount(
    user.stripeCustomerId,
    {
      external_account: {
        object: 'bank_account',
        country: 'US',
        currency: 'usd',
        routing_number: routingNumber,
        account_number: accountNumber,
      },
    },
  );

  // You can optionally delete the previous bank account (if needed)
  const customer = await stripe.customers.retrieve(user.stripeCustomerId);
  const oldBankAccount = customer.sources.data.find(
    (source) => source.object === 'bank_account',
  );
  if (oldBankAccount) {
    await stripe.customers.deleteSource(
      user.stripeCustomerId,
      oldBankAccount.id,
    );
  }
  await User.findByIdAndUpdate(
    userData.id,
    { bankAccountId: newBankAccount.id },
    { new: true, runValidators: true },
  );
  return { bankAccountId: newBankAccount.id };
};

const StripeService = {
  linkBankAccount,
  updateBankInfo,
};

export default StripeService;
