/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { IInviteTeamPayload, ITeam } from './team.interface';
import Team from './team.model';
import League from '../league/league.model';
import Player from '../player/player.model';
import mongoose from 'mongoose';
import TeamBookmark from '../teamBookmark/team.bookmark.model';
import { User } from '../user/user.model';
import { USER_ROLE } from '../user/user.constant';

const createTeamIntoDB = async (payload: ITeam) => {
  if (payload.dueAmount || payload.totalTips || payload.paidAmount) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not add due amount, total tips and paid amount',
    );
  }

  const league = await League.findById(payload.league);
  if (!league) {
    throw new AppError(httpStatus.NOT_FOUND, "League doesn't exits");
  }
  const result = await Team.create({ ...payload, sport: league.sport });
  return result;
};

const getAllTeamsFromDB = async (
  userId: string,
  query: Record<string, any>,
) => {
  const teamQuery = new QueryBuilder(
    Team.find().populate({ path: 'league', select: 'name sport' }).lean(),
    query,
  )
    .search(['name', 'sport'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await teamQuery.countTotal();
  const result = await teamQuery.modelQuery;
  const bookmarks = await TeamBookmark.find({ user: userId }).select('team');
  const bookmarkTeamIds = new Set(bookmarks.map((b) => b?.team?.toString()));

  const enrichedResult = result.map((team) => ({
    ...team,
    isBookmark: bookmarkTeamIds.has((team as any)._id.toString()),
  }));

  return {
    meta,
    result: enrichedResult,
  };
};

const getSingleTeamFromDB = async (id: string) => {
  const team = await Team.findById(id).populate({
    path: 'league',
    select: 'name sport',
  });
  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
  }
  return team;
};

const updateTeamIntoDB = async (id: string, payload: Partial<ITeam>) => {
  const team = await Team.findById(id);
  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
  }

  if (payload.league) {
    const league = await League.findById(payload.league);
    if (!league) {
      throw new AppError(httpStatus.NOT_FOUND, 'League not found');
    }
  }
  const result = await Team.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteTeamFromDB = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const team = await Team.findById(id).session(session);
    if (!team) {
      throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
    }
    await Team.findByIdAndDelete(id).session(session);
    await Player.deleteMany({ team: id }).session(session);
    await TeamBookmark.deleteMany({ team: id }).session(session);
    await session.commitTransaction();
    session.endSession();
    return team;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const sendMoneyToTeam = async (id: string, amount: number) => {
  const team = await Team.findById(id);
  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
  }
  if (team.dueAmount < amount) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not send money more then due amount',
    );
  }

  const result = await Team.findByIdAndUpdate(
    id,
    {
      $inc: { dueAmount: -amount, paidAmount: amount },
    },
    { new: true, runValidators: true },
  );

  return result;
};

// const inviteTeam = async (id: string, payload: IInviteTeamPayload) => {
//   const team = await Team.findById(id);
//   if (!team) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
//   }

//   const isExistUser = await User.findOne({ username: payload.username });
//   if (!isExistUser) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'This username already exits');
//   }

//   const userData = {
//     username: payload.username,
//     password: payload.password,
//     role: USER_ROLE.team,
//     isVerified: true,
//   };

//   const user = await User.create(userData);

//   await Team.findByIdAndUpdate(id, { user: user._id });

//   return user;
// };

const inviteTeam = async (id: string, payload: IInviteTeamPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const team = await Team.findById(id).session(session);
    if (!team) {
      throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
    }

    const isExistUser = await User.findOne({
      username: payload.username,
    }).session(session);
    if (isExistUser) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'This username already exists',
      );
    }

    const userData = {
      username: payload.username,
      password: payload.password,
      role: USER_ROLE.team,
      isVerified: true,
    };

    const user = await User.create([userData], { session });

    await Team.findByIdAndUpdate(id, { user: user[0]._id }, { session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return user[0];
  } catch (error) {
    // Rollback the transaction in case of an error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const TeamServices = {
  createTeamIntoDB,
  getAllTeamsFromDB,
  getSingleTeamFromDB,
  updateTeamIntoDB,
  deleteTeamFromDB,
  sendMoneyToTeam,
  inviteTeam,
};

export default TeamServices;
