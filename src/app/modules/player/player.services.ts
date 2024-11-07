/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { IPlayer } from './player.interface';
import Player from './player.model';
import Team from '../team/team.model';
import League from '../league/league.model';

const createPlayerIntoDB = async (payload: IPlayer) => {
  if (payload.dueAmount || payload.totalTips || payload.paidAmount) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'You can not add total tips , due amount and paid amount',
    );
  }

  const league = await League.findById(payload.league);
  if (!league) {
    throw new AppError(httpStatus.NOT_FOUND, 'League not found');
  }
  const team = await Team.findOne({
    _id: payload.team,
    league: payload.league,
  });
  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
  }

  const result = await Player.create(payload);
  return result;
};

const getAllPlayersFromDB = async (query: Record<string, any>) => {
  const playerQuery = new QueryBuilder(
    Player.find()
      .populate({ path: 'league', select: 'name sport' })
      .populate({ path: 'team', select: 'name' }),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await playerQuery.countTotal();
  const result = await playerQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSinglePlayerFromDB = async (id: string) => {
  const player = await Player.findById(id);
  if (!player) {
    throw new AppError(httpStatus.NOT_FOUND, 'Player not found');
  }
  return player;
};

const updatePlayerIntoDB = async (id: string, payload: Partial<IPlayer>) => {
  const player = await Player.findById(id);
  if (!player) {
    throw new AppError(httpStatus.NOT_FOUND, 'Player not found');
  }

  if (payload.league) {
    const league = await League.findById(payload.league);
    if (!league) {
      throw new AppError(httpStatus.NOT_FOUND, 'League not found');
    }
  }
  if (payload.team) {
    const team = await Team.findOne({
      _id: payload.team,
      league: payload.league,
    });
    if (!team) {
      throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
    }
  }

  const result = await Player.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deletePlayerFromDB = async (id: string) => {
  const player = await Player.findById(id);
  if (!player) {
    throw new AppError(httpStatus.NOT_FOUND, 'Player not found');
  }
  const result = await Player.findByIdAndDelete(id);
  return result;
};

const PlayerServices = {
  createPlayerIntoDB,
  getAllPlayersFromDB,
  getSinglePlayerFromDB,
  updatePlayerIntoDB,
  deletePlayerFromDB,
};

export default PlayerServices;
