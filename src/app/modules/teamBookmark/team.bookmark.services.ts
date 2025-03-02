import httpStatus from 'http-status';
import AppError from '../../error/appError';
import TeamBookmark from './team.bookmark.model';
import Team from '../team/team.model';

const createBookmarkIntoDB = async (teamId: string, normalUserId: string) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Team not found');
  }
  const isExists = await TeamBookmark.findOne({
    team: teamId,
    user: normalUserId,
  });
  if (isExists) {
    await TeamBookmark.findOneAndDelete({
      team: teamId,
      user: normalUserId,
    });
    return null;
  } else {
    const result = await TeamBookmark.create({
      team: teamId,
      user: normalUserId,
    });
    return result;
  }
};

// get bookmark from db
const getMyBookmarkFromDB = async (normalUserId: string) => {
  const result = await TeamBookmark.find({ user: normalUserId }).populate({
    path: 'team',
    // select: 'name team_logo team_bg_image sport',
    // populate: [{ path: 'league', select: 'name sport' }],
    populate: [{ path: 'league' }],
  });
  return result;
};

// delete bookmark
const deleteBookmarkFromDB = async (id: string, normalUserId: string) => {
  const bookmark = await TeamBookmark.findOne({
    team: id,
    user: normalUserId,
  });

  if (!bookmark) {
    throw new AppError(httpStatus.NOT_FOUND, 'This bookmark does not exists');
  }
  const result = await TeamBookmark.findOneAndDelete({
    team: id,
    user: normalUserId,
  });
  return result;
};
const TeamBookmarkServices = {
  createBookmarkIntoDB,
  getMyBookmarkFromDB,
  deleteBookmarkFromDB,
};

export default TeamBookmarkServices;
