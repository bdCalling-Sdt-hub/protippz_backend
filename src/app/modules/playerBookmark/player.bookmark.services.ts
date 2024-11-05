import httpStatus from 'http-status';
import AppError from '../../error/appError';
import PlayerBookmark from './player.bookmark.model';

const createPlayerBookmarkIntoDB = async (playerId: string, normalUserId: string) => {
  const isExists = await PlayerBookmark.findOne({
    player: playerId,
    user: normalUserId,
  });
  if (isExists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You already added this player in bookmark',
    );
  }
  const result = await PlayerBookmark.create({
    player: playerId,
    user: normalUserId,
  });
  return result;
};

// Get bookmarks from the database
const getMyPlayerBookmarkFromDB = async (normalUserId: string) => {
  const result = await PlayerBookmark.find({ user: normalUserId });
  return result;
};

// Delete a bookmark
const deletePlayerBookmarkFromDB = async (id: string, normalUserId: string) => {
  const bookmark = await PlayerBookmark.findOne({
    _id: id,
    user: normalUserId,
  });

  if (!bookmark) {
    throw new AppError(httpStatus.NOT_FOUND, 'This bookmark does not exist');
  }
  const result = await PlayerBookmark.findOneAndDelete({
    _id: id,
    user: normalUserId,
  });
  return result;
};

const PlayerBookmarkServices = {
  createPlayerBookmarkIntoDB,
  getMyPlayerBookmarkFromDB,
  deletePlayerBookmarkFromDB,
};

export default PlayerBookmarkServices;
