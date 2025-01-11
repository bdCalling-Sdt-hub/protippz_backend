/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../user/user.model';
import Stripe from 'stripe';
import config from '../../config';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import plaidClient from '../../utilities/plaidClient';
import { USER_ROLE } from '../user/user.constant';
import Player from '../player/player.model';
import Team from '../team/team.model';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);

const exchangePublicToken = async (payload: any) => {
  const { public_token } = payload;

  const tokenResponse = await plaidClient.itemPublicTokenExchange({
    public_token,
  });

  const { access_token, item_id } = tokenResponse.data;
  console.log(access_token, item_id);

  // Store the access_token securely
  return { access_token };
};

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

// create stripe connected account ------------------------------
const createConnectedAccount = async (
  userData: JwtPayload,
  access_token: string,
) => {
  // Step 1: Create a Stripe account
  const account = await stripe.accounts.create({
    type: 'standard',
  });

  // Step 2: Retrieve bank account information from Plaid
  const plaidResponse = (
    await plaidClient.authGet({
      access_token,
    })
  ).data;

  // Extract bank account and routing numbers from the response
  const achDetails = plaidResponse.numbers.ach[0]; // First ACH account
  const bankAccount = plaidResponse.accounts.find(
    (account) => account.account_id === achDetails.account_id,
  );

  if (!achDetails || !bankAccount) {
    throw new Error('Bank account details not found in Plaid response.');
  }

  // Step 3: Link the bank account to Stripe
  const externalAccount = await stripe.accounts.createExternalAccount(
    account.id,
    {
      external_account: {
        object: 'bank_account',
        country: 'US', // Adjust based on the country
        currency: 'usd', // Adjust based on the currency
        routing_number: achDetails.routing,
        account_number: achDetails.account,
      },
    },
  );

  if (userData.role == USER_ROLE.player) {
    await Player.findByIdAndUpdate(
      userData?.profileId,
      { stripe_account_id: account.id },
      { new: true, runValidators: true },
    );
  } else if (userData.role == USER_ROLE.team) {
    await Team.findByIdAndUpdate(
      userData?.profileId,
      { stripe_account_id: account.id },
      { new: true, runValidators: true },
    );
  }

  console.log('external account', externalAccount);

  // Return the Stripe account and linked external account
  return { stripe_account_id: account.id };
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
  exchangePublicToken,
  createConnectedAccount,
  linkBankAccount,
  updateBankInfo,
};

export default StripeService;
