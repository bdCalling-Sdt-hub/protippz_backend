/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { ITeam } from './team.interface';
import Team from './team.model';
import League from '../league/league.model';
import Player from '../player/player.model';
import mongoose from 'mongoose';

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
  const result = await Team.create(payload);
  return result;
};

// const getAllTeamsFromDB = async (query: Record<string, any>) => {
//   const teamQuery = new QueryBuilder(
//     Team.find().populate({ path: 'league', select: 'name sport' }),
//     query,
//   )
//     .search(['name'])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const meta = await teamQuery.countTotal();
//   const result = await teamQuery.modelQuery;

//   return {
//     meta,
//     result,
//   };
// };

const getAllTeamsFromDB = async (query: Record<string, any>) => {

  const sortField = query.sort as string;
  const isLeagueSort = sortField === 'league.sport' || sortField === '-league.sport';
  console.log(isLeagueSort);

  const teamQuery = new QueryBuilder(
    isLeagueSort
      ? Team.find()
      : Team.find().populate({ path: 'league', select: 'name sport' }),
    query
  )
    .search(['name'])
    .filter()
    .paginate()
    .fields();

  if (isLeagueSort) {
    // Apply sorting on the populated field if `league.sport` sorting is requested
    const order = sortField.startsWith('-') ? -1 : 1;
    teamQuery.modelQuery = teamQuery.modelQuery.populate({
      path: 'league',
      select: 'name sport',
      options: { sort: { sport: order } },
    });
  } else {
    teamQuery.sort(); // Apply normal sorting otherwise
  }

  const meta = await teamQuery.countTotal();
  const result = await teamQuery.modelQuery;

  return {
    meta,
    result,
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

    await session.commitTransaction();
    session.endSession();
    return team;
  } catch (error) {
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
};

export default TeamServices;
