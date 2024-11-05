import httpStatus from 'http-status';
import AppError from '../../error/appError';
import TeamBookmark from './team.bookmark.model';

const createBookmarkIntoDB = async (teamId: string, normalUserId: string) => {
  const isExists = await TeamBookmark.findOne({
    team: teamId,
    user: normalUserId,
  });
  if (isExists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You already add this shop in bookmark',
    );
  }
  const result = await TeamBookmark.create({
    team: teamId,
    user: normalUserId,
  });
  return result;
};

// get bookmark from db
const getMyBookmarkFromDB = async (normalUserId: string) => {
  const result = await TeamBookmark.find({ user: normalUserId });
  return result;
};

// delete bookmark
const deleteBookmarkFromDB = async (id: string, normalUserId: string) => {
  const bookmark = await TeamBookmark.findOne({
    _id: id,
    user: normalUserId,
  });

  if (!bookmark) {
    throw new AppError(httpStatus.NOT_FOUND, 'This bookmark does not exists');
  }
  const result = await TeamBookmark.findOneAndDelete({
    _id: id,
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
