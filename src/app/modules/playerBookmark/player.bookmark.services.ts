import httpStatus from 'http-status';
import AppError from '../../error/appError';
import PlayerBookmark from './player.bookmark.model';
import Player from '../player/player.model';

const createPlayerBookmarkIntoDB = async (
  playerId: string,
  normalUserId: string,
) => {
  const player = await Player.findById(playerId);
  if (!player) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Player not found');
  }
  const isExists = await PlayerBookmark.findOne({
    player: playerId,
    user: normalUserId,
  });
  if (isExists) {
    await PlayerBookmark.findOneAndDelete({
      player: playerId,
      user: normalUserId,
    });
    return null;
  } else {
    const result = await PlayerBookmark.create({
      player: playerId,
      user: normalUserId,
    });
    return result;
  }
};

// Get bookmarks from the database
const getMyPlayerBookmarkFromDB = async (normalUserId: string) => {
  const result = await PlayerBookmark.find({ user: normalUserId }).populate({
    path: 'player',
    select: 'name position league team player_image player_bg_image',
    populate: [
      // { path: 'team', select: 'name sport' },
      // { path: 'league', select: 'name sport' },
      { path: 'team' },
      { path: 'league' },
    ],
  });
  return result;
};

// Delete a bookmark
const deletePlayerBookmarkFromDB = async (id: string, normalUserId: string) => {
  const bookmark = await PlayerBookmark.findOne({
    player: id,
    user: normalUserId,
  });

  if (!bookmark) {
    throw new AppError(httpStatus.NOT_FOUND, 'This bookmark does not exist');
  }
  const result = await PlayerBookmark.findOneAndDelete({
    player: id,
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
