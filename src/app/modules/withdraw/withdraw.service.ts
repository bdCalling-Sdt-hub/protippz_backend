/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from 'jsonwebtoken';
import { IWithdraw } from './withdraw.interface';
import { USER_ROLE } from '../user/user.constant';
import NormalUser from '../normalUser/normalUser.model';
import Player from '../player/player.model';
import Team from '../team/team.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { WithdrawalRequest } from './withdraw.model';
import QueryBuilder from '../../builder/QueryBuilder';
import Transaction from '../transaction/transaction.model';
import {
  ENUM_PAYMENT_STATUS,
  ENUM_TRANSACTION_TYPE,
} from '../../utilities/enum';
import Notification from '../notification/notification.model';
import Stripe from 'stripe';
import config from '../../config';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);
const crateWithdrawRequest = async (user: JwtPayload, payload: IWithdraw) => {
  if (user.role === USER_ROLE.user) {
    const normalUser = await NormalUser.findById(user?.profileId);
    if (!normalUser) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (normalUser?.totalAmount < payload.amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You don't have available amount in you account",
      );
    }
  }
  if (user.role === USER_ROLE.player) {
    const player = await Player.findById(user.profileId);
    if (!player) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (player?.dueAmount < payload.amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You don't have available amount in you account",
      );
    }
  }
  if (user.role === USER_ROLE.team) {
    const team = await Team.findById(user.profileId);
    if (!team) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (team?.dueAmount < payload.amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You don't have available amount in you account",
      );
    }
  }

  const entityType =
    user.role === USER_ROLE.user
      ? 'NormalUser'
      : user.role === USER_ROLE.player
        ? 'Player'
        : 'Team';

  const result = await WithdrawalRequest.create({
    ...payload,
    entityType: entityType,
    entityId: user?.profileId,
  });

  if (entityType === 'NormalUser') {
    await NormalUser.findByIdAndUpdate(
      result.entityId,
      { $inc: { totalAmount: -payload.amount } },
      { new: true, runValidators: true },
    );
  }
  if (entityType === 'Player') {
    await Player.findByIdAndUpdate(
      result.entityId,
      { $inc: { dueAmount: -payload.amount, paidAmount: payload.amount } },
      { new: true, runValidators: true },
    );
  }
  if (entityType === 'Team') {
    await Team.findByIdAndUpdate(
      result.entityId,
      { $inc: { dueAmount: -payload.amount, paidAmount: payload.amount } },
      { new: true, runValidators: true },
    );
  }

  return result;
};

const getAllWithdrawRequest = async (query: Record<string, any>) => {
  const { searchTerm, ...restQuery } = query;

  // Step 1: Query the database with the populate option
  const withdrawQuery = WithdrawalRequest.find().populate({
    path: 'entityId',
    select: 'name profile_image player_image team_logo',
  });

  // Pass the query to QueryBuilder for filtering, sorting, pagination, and fields
  const queryBuilder = new QueryBuilder(withdrawQuery, restQuery)
    .filter()
    .sort()
    .paginate()
    .fields();

  // Execute the query to get initial results with populate
  const rawResults = await queryBuilder.modelQuery;

  // Step 2: Manually filter results by search term in `entityId.name`
  let filteredResults = rawResults;
  if (searchTerm) {
    const regex = new RegExp(searchTerm, 'i'); // Case-insensitive regex
    filteredResults = rawResults.filter((item: any) =>
      regex.test(item.entityId?.name),
    );
  }

  // Get the count of filtered results for pagination metadata
  // const meta = { total: filteredResults.length };
  const meta = await queryBuilder.countTotal();

  return {
    meta,
    result: filteredResults,
  };
};

// update withdraw status
const updateWithdrawRequestStatus = async (id: string, status: string) => {
  const withdraw = await WithdrawalRequest.findById(id);
  if (!withdraw) {
    throw new AppError(httpStatus.NOT_FOUND, 'Withdraw not found');
  }

  const updateWithdraw = await WithdrawalRequest.findByIdAndUpdate(
    id,
    { status: status },
    { new: true, runValidators: true },
  );

  const transactionData = {
    amount: updateWithdraw?.amount,
    transactionType: ENUM_TRANSACTION_TYPE.WITHDRAW,
    paymentBy: updateWithdraw?.withdrawOption,
    status: ENUM_PAYMENT_STATUS.SUCCESS,
    entityId: updateWithdraw?.entityId,
    entityType: updateWithdraw?.entityType,
  };

  await Transaction.create(transactionData);
  const notificationData = {
    title: 'Withdrawal request approved',
    message: `Admin approve your withdrawal request and send you money`,
    receiver: updateWithdraw?.entityId,
  };
  await Notification.create(notificationData);
  return updateWithdraw;
};

// const achWithdraw = async (user: JwtPayload, amount: number) => {
//   if (user.role == USER_ROLE.player) {
//     const player = await Player.findById(user.profileId);
//     if (!player) {
//       throw new AppError(httpStatus.NOT_FOUND, 'Player not found');
//     }
//     // First, transfer funds from platform's account to connected account-----------------
//     const amountInCent = Number((amount * 100).toFixed(2));
//     const stripe_account_id = player.stripe_account_id;
//     const transfer = await stripe.transfers.create({
//       amount: amountInCent,
//       currency: 'usd',
//       destination: stripe_account_id as string,
//     });
//     console.log('transfer', transfer);
//     // Initiate the payout to the connected account's bank--------------
//     const payout = await stripe.payouts.create(
//       {
//         amount: amountInCent,
//         currency: 'usd',
//       },
//       {
//         stripeAccount: stripe_account_id as string,
//       },
//     );
//     console.log('payout', payout);
//   } else if (user.role == USER_ROLE.team) {
//     const team = await Team.findById(user.profileId);
//     if (!team) {
//       throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
//     }
//     // First, transfer funds from platform's account to connected account-----------------
//     const amountInCent = Number((amount * 100).toFixed(2));
//     const stripe_account_id = team.stripe_account_id;
//     const transfer = await stripe.transfers.create({
//       amount: amountInCent,
//       currency: 'usd',
//       destination: stripe_account_id as string,
//     });
//     console.log('transfer', transfer);
//     // Initiate the payout to the connected account's bank--------------
//     const payout = await stripe.payouts.create(
//       {
//         amount: amountInCent,
//         currency: 'usd',
//       },
//       {
//         stripeAccount: stripe_account_id as string,
//       },
//     );
//     console.log('payout', payout);
//   }
// };

const achWithdraw = async (user: JwtPayload, amount: number) => {
  const amountInCent = Number((amount * 100).toFixed(2));

  if (user.role === USER_ROLE.player) {
    const player = await Player.findById(user.profileId);
    if (!player) {
      throw new AppError(httpStatus.NOT_FOUND, 'Player not found');
    }
    if (player.dueAmount > amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You don't have enough balance",
      );
    }

    const stripe_account_id = player.stripe_account_id;

    try {
      // Transfer funds
      const transfer: any = await stripe.transfers.create({
        amount: amountInCent,
        currency: 'usd',
        destination: stripe_account_id as string,
      });
      console.log('transfer', transfer);

      if (transfer.status !== 'succeeded') {
        throw new AppError(httpStatus.BAD_REQUEST, 'Transfer failed');
      }

      // Payout to bank
      const payout = await stripe.payouts.create(
        {
          amount: amountInCent,
          currency: 'usd',
        },
        {
          stripeAccount: stripe_account_id as string,
        },
      );
      console.log('payout', payout);

      if (payout.status !== 'paid') {
        throw new AppError(httpStatus.BAD_REQUEST, 'Payout failed');
      }

      // Update player data in database
      await Player.findByIdAndUpdate(user.profileId, {
        $inc: { paidAmount: amount, dueAmount: -amount },
      });
    } catch (error) {
      console.error('Error during transfer or payout:', error);
      throw error;
    }
  } else if (user.role === USER_ROLE.team) {
    const team = await Team.findById(user.profileId);
    if (!team) {
      throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
    }
    if (team.dueAmount > amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You don't have enough balance",
      );
    }

    const stripe_account_id = team.stripe_account_id;

    try {
      // Transfer funds
      const transfer: any = await stripe.transfers.create({
        amount: amountInCent,
        currency: 'usd',
        destination: stripe_account_id as string,
      });
      console.log('transfer', transfer);

      if (transfer.status !== 'succeeded') {
        throw new AppError(httpStatus.BAD_REQUEST, 'Transfer failed');
      }

      // Payout to bank
      const payout = await stripe.payouts.create(
        {
          amount: amountInCent,
          currency: 'usd',
        },
        {
          stripeAccount: stripe_account_id as string,
        },
      );
      console.log('payout', payout);

      if (payout.status !== 'paid') {
        throw new AppError(httpStatus.BAD_REQUEST, 'Payout failed');
      }

      // Update team data in database
      await Player.findByIdAndUpdate(user.profileId, {
        $inc: { paidAmount: amount, dueAmount: -amount },
      });
    } catch (error) {
      console.error('Error during transfer or payout:', error);
      throw error;
    }
  }
};

const WithdrawRequestServices = {
  crateWithdrawRequest,
  getAllWithdrawRequest,
  updateWithdrawRequestStatus,
  achWithdraw,
};

export default WithdrawRequestServices;
