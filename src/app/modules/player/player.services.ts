/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { IPlayer } from './player.interface';
import Player from './player.model';
import Team from '../team/team.model';
import League from '../league/league.model';
import PlayerBookmark from '../playerBookmark/player.bookmark.model';
import { IInviteTeamPayload } from '../team/team.interface';
import mongoose from 'mongoose';
import { User } from '../user/user.model';
import { USER_ROLE } from '../user/user.constant';
import unlinkFile from '../../utilities/unlinkFile';
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

const getAllPlayersFromDB = async (
  userId: string,
  query: Record<string, any>,
) => {
  if (query.searchTerm) {
    delete query.page;
    delete query.limit;
  }
  let filterQuery = {};
  if (query.signIn) {
    filterQuery = { email: { $nin: [null, ''] } };
    delete query.signIn;
  }
  const playerQuery = new QueryBuilder(
    Player.find({ ...filterQuery })
      .populate({ path: 'league', select: 'name sport' })
      .populate({ path: 'team', select: 'name' })
      .lean(), // Ensures the result is plain JavaScript objects
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await playerQuery.countTotal();
  const result = await playerQuery.modelQuery;

  const bookmarks = await PlayerBookmark.find({ user: userId }).select(
    'player',
  );
  const bookmarkPlayerIds = new Set(
    bookmarks.map((b) => b?.player?.toString()),
  );

  const enrichedResult = result.map((player) => ({
    ...player,
    isBookmark: bookmarkPlayerIds.has((player as any)._id.toString()),
  }));

  return {
    meta,
    result: enrichedResult,
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
  if (payload.player_image) {
    unlinkFile(player.player_image);
  }
  if (payload.player_bg_image) {
    unlinkFile(player.player_bg_image);
  }
  return result;
};

const deletePlayerFromDB = async (id: string) => {
  const player = await Player.findById(id);
  if (!player) {
    throw new AppError(httpStatus.NOT_FOUND, 'Player not found');
  }
  const result = await Player.findByIdAndDelete(id);
  await PlayerBookmark.deleteMany({ player: id });
  await User.findByIdAndDelete(player.user);
  unlinkFile(player.player_bg_image);
  unlinkFile(player.player_image);
  return result;
};

const deletePlayersFromDB = async (ids: string[]) => {
  const players = await Player.find({ _id: { $in: ids } });
  if (!players || players.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No players found');
  }

  // Collect related data for cleanup
  const playerIdsToDelete = players.map((player) => player._id);
  const userIdsToDelete = players.map((player) => player.user);
  const playerBgImagesToDelete = players.map(
    (player) => player.player_bg_image,
  );
  const playerImagesToDelete = players.map((player) => player.player_image);

  // Delete players and related data
  const deletePlayerPromises = [
    Player.deleteMany({ _id: { $in: playerIdsToDelete } }),
    PlayerBookmark.deleteMany({ player: { $in: playerIdsToDelete } }),
    User.deleteMany({ _id: { $in: userIdsToDelete } }),
  ];

  await Promise.all(deletePlayerPromises);

  const unlinkPromises = [
    ...playerBgImagesToDelete.map((image) => unlinkFile(image)),
    ...playerImagesToDelete.map((image) => unlinkFile(image)),
  ];

  try {
    await Promise.all(unlinkPromises);
  } catch (error) {
    console.error('Error unlinking files:', error);
  }

  return players.length;
};

const sendMoneyToPlayer = async (id: string, amount: number) => {
  const player = await Player.findById(id);
  if (!player) {
    throw new AppError(httpStatus.NOT_FOUND, 'Player not found');
  }
  if (player.dueAmount < amount) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not send money more then due amount',
    );
  }

  const result = await Player.findByIdAndUpdate(
    id,
    {
      $inc: { dueAmount: -amount, paidAmount: amount },
    },
    { new: true, runValidators: true },
  );

  return result;
};

// invite player
const invitePlayer = async (id: string, payload: IInviteTeamPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const player = await Player.findById(id).session(session);
    if (!player) {
      throw new AppError(httpStatus.NOT_FOUND, 'Player not found');
    }
    if (player.username) {
      throw new AppError(httpStatus.CONFLICT, 'This player already invited');
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
      role: USER_ROLE.player,
      isVerified: true,
    };
    const user = await User.create([userData], { session });

    const updatePlayer = await Player.findByIdAndUpdate(
      id,
      {
        user: user[0]._id,
        username: payload.username,
        invitedPassword: payload.password,
      },
      { session },
    );
    console.log('update', updatePlayer);
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

// edit player address
const editTeamAddressTax = async (profileId: string, payload: any) => {
  const { address, taxInfo, ...remainingPlayerData } = payload;
  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingPlayerData,
  };

  if (address && Object.keys(address).length) {
    for (const [key, value] of Object.entries(address)) {
      modifiedUpdatedData[`address.${key}`] = value;
    }
  }
  if (taxInfo && Object.keys(taxInfo).length) {
    for (const [key, value] of Object.entries(taxInfo)) {
      modifiedUpdatedData[`taxInfo.${key}`] = value;
    }
  }

  const result = await Player.findByIdAndUpdate(
    profileId,
    modifiedUpdatedData,
    {
      new: true,
      runValidators: true,
    },
  );
  return result;
};

const PlayerServices = {
  createPlayerIntoDB,
  getAllPlayersFromDB,
  getSinglePlayerFromDB,
  updatePlayerIntoDB,
  deletePlayerFromDB,
  sendMoneyToPlayer,
  invitePlayer,
  editTeamAddressTax,
  deletePlayersFromDB,
};

export default PlayerServices;
