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
const createLinkToken = async (userData: JwtPayload) => {
  let user;
  if (userData.role == USER_ROLE.player) {
    user = await Player.findById(userData?.profileId);
  }

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const clientUserId = user._id.toString();
  const request = {
    user: {
      client_user_id: clientUserId,
    },
    client_name: 'Plaid Test App',
    products: ['auth'],
    language: 'en',
    country_codes: ['US'],
  };
  try {
    const createTokenResponse = await plaidClient.linkTokenCreate(
      request as any,
    );
    console.log('created token', createTokenResponse);
    return createTokenResponse.data;
  } catch (error) {
    // handle error
    console.log('error is ', error);
  }
};

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
        country: 'US',
        currency: 'usd',
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
  // Create a Stripe account
  const account = await stripe.accounts.create({
    type: 'standard',
  });

  // Retrieve bank account information from Plaid
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

  //Link the bank account to Stripe
  const externalAccount = await stripe.accounts.createExternalAccount(
    account.id,
    {
      external_account: {
        object: 'bank_account',
        country: 'US',
        currency: 'usd',
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
  const customer: any = await stripe.customers.retrieve(user.stripeCustomerId);
  const oldBankAccount = customer.sources.data.find(
    (source: any) => source.object === 'bank_account',
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

const createConnectedAccountAndOnboardingLink = async (
  userData: JwtPayload,
  profileId: string,
) => {
  const user = await User.findById(userData?.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (userData?.role == USER_ROLE.player) {
    const player = await Player.findById(profileId);
    if (player?.isStripeConnected) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You already added bank information',
      );
    }
  } else if (userData?.role == USER_ROLE.team) {
    const team = await Team.findById(profileId);
    if (team?.isStripeConnected) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You already added bank information',
      );
    }
  }

  //  Create a connected account
  const account = await stripe.accounts.create({
    type: 'express',
    email: user.email,
    country: 'US',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  if (userData?.role == USER_ROLE.team) {
    const updatedTeamProfile = await Team.findByIdAndUpdate(
      profileId,
      { stripAccountId: account.id },
      { new: true, runValidators: true },
    );

    if (!updatedTeamProfile) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Server temporarily unavailable',
      );
    }
  } else if (userData?.role == USER_ROLE.player) {
    const updatedPlayerProfile = await Player.findByIdAndUpdate(
      profileId,
      { stripAccountId: account.id },
      { new: true, runValidators: true },
    );

    if (!updatedPlayerProfile) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Server temporarily unavailable',
      );
    }
  }

  //  Create the onboarding link
  const onboardingLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${config.onboarding_refresh_url}?accountId=${account?.id}`,
    return_url: `${config.onboarding_return_url}/account-created`,
    type: 'account_onboarding',
  });
  return onboardingLink.url;
};

const updateOnboardingLink = async (userData: JwtPayload) => {
  let stripAccountId;
  if (userData.role == USER_ROLE.player) {
    const player = await Player.findById(userData.profileId);
    stripAccountId = player?.stripAccountId;
  } else if (userData.role == USER_ROLE.team) {
    const player = await Player.findById(userData.profileId);
    stripAccountId = player?.stripAccountId;
  }
  const accountLink = await stripe.accountLinks.create({
    account: stripAccountId as string,
    refresh_url: `${config.onboarding_refresh_url}?accountId=${stripAccountId}`,
    return_url: config.onboarding_return_url,
    type: 'account_onboarding',
  });

  return { link: accountLink.url };
};

const StripeService = {
  createLinkToken,
  exchangePublicToken,
  createConnectedAccount,
  linkBankAccount,
  updateBankInfo,
  createConnectedAccountAndOnboardingLink,
  updateOnboardingLink,
};

export default StripeService;
