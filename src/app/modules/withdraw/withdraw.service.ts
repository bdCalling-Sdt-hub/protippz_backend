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
  const withdrawQuery = new QueryBuilder(
    WithdrawalRequest.find().populate({
      path: 'entityId',
      select: 'name profile_image player_image team_logo',
    }),
    query,
  )
    .search(['entityType'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await withdrawQuery.countTotal();
  const result = await withdrawQuery.modelQuery;

  return {
    meta,
    result,
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

  return updateWithdraw;
};

const WithdrawRequestServices = {
  crateWithdrawRequest,
  getAllWithdrawRequest,
  updateWithdrawRequestStatus
};

export default WithdrawRequestServices;
