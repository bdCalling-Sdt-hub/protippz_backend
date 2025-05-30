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
import unlinkFile from '../../utilities/unlinkFile';
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
  if (query.searchTerm) {
    delete query.page;
    delete query.limit;
  }
  // const teamQuery = new QueryBuilder(
  //   Team.find().populate({ path: 'league', select: 'name sport' }).lean(),
  //   query,
  // )
  //   .search(['name', 'sport'])
  //   .filter()
  //   .sort()
  //   .paginate()
  //   .fields();
  let filterQuery = {};
  if (query.signIn) {
    filterQuery = { email: { $nin: [null, ''] } };
    delete query.signIn;
  }

  const teamQuery = new QueryBuilder(
    Team.find({ ...filterQuery })
      .populate({ path: 'league', select: 'name sport' })
      .lean(),
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
  if (payload.team_logo) {
    unlinkFile(team.team_logo);
  }
  if (payload.team_bg_image) {
    unlinkFile(team.team_bg_image);
  }
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
    await User.findByIdAndDelete(team.user).session(session);
    await session.commitTransaction();
    session.endSession();
    // const rootPath = process.cwd();
    // const teamLogoPath = path.join(rootPath, team.team_logo);
    // const teamBgImagePath = path.join(rootPath, team.team_bg_image);

    // try {
    //   await fs.unlink(teamLogoPath);
    //   await fs.unlink(teamBgImagePath);
    // } catch (error) {
    //   throw new AppError(
    //     httpStatus.INTERNAL_SERVER_ERROR,
    //     `Error deleting associated file`,
    //   );
    // }
    unlinkFile(team.team_bg_image);
    unlinkFile(team.team_logo);
    return team;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const deleteTeams = async (ids: string[]) => {
  const teams = await Team.find({ _id: { $in: ids } });
  if (!teams || teams.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No teams found');
  }

  // Collect related data for cleanup
  const teamIdsToDelete = teams.map((team) => team._id);
  const userIdsToDelete = teams.map((team) => team.user);
  const teamBgImagesToDelete = teams.map((team) => team.team_bg_image);
  const teamImagesToDelete = teams.map((team) => team.team_logo);

  // Delete players and related data
  const deleteTeamPromises = [
    Team.deleteMany({ _id: { $in: teamIdsToDelete } }),
    TeamBookmark.deleteMany({ team: { $in: teamIdsToDelete } }),
    User.deleteMany({ _id: { $in: userIdsToDelete } }),
  ];

  await Promise.all(deleteTeamPromises);

  const unlinkPromises = [
    ...teamBgImagesToDelete.map((image) => unlinkFile(image)),
    ...teamImagesToDelete.map((image) => unlinkFile(image)),
  ];

  try {
    await Promise.all(unlinkPromises);
  } catch (error) {
    console.error('Error unlinking files:', error);
  }

  return teams.length;
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
    if (team.username) {
      throw new AppError(httpStatus.CONFLICT, 'This team already invited');
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
    await Team.findByIdAndUpdate(
      id,
      {
        user: user[0]._id,
        username: payload.username,
        invitedPassword: payload.password,
      },
      { session },
    );
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
  // console.log('address', address);
  // console.log('remaining', remainingPlayerData);
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

  const result = await Team.findByIdAndUpdate(profileId, modifiedUpdatedData, {
    new: true,
    runValidators: true,
  });
  return result;
};
const TeamServices = {
  createTeamIntoDB,
  getAllTeamsFromDB,
  getSingleTeamFromDB,
  updateTeamIntoDB,
  deleteTeamFromDB,
  sendMoneyToTeam,
  inviteTeam,
  editTeamAddressTax,
  deleteTeams,
};

export default TeamServices;
