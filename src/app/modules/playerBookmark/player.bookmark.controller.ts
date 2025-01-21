import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import PlayerBookmarkServices from './player.bookmark.services';

const createPlayerBookmark = catchAsync(async (req, res) => {
  const result = await PlayerBookmarkServices.createPlayerBookmarkIntoDB(
    req?.body?.playerId,
    req?.user?.profileId,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: result
      ? 'Player bookmark created successfully'
      : 'Player bookmark deleted successfully',
    data: result,
  });
});

// Get my bookmarks
const getMyPlayerBookmark = catchAsync(async (req, res) => {
  const result = await PlayerBookmarkServices.getMyPlayerBookmarkFromDB(
    req?.user?.profileId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Player bookmarks retrieved successfully',
    data: result,
  });
});

// Delete bookmark
const deletePlayerBookmark = catchAsync(async (req, res) => {
  const result = await PlayerBookmarkServices.deletePlayerBookmarkFromDB(
    req?.params?.id,
    req?.user?.profileId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Player bookmark deleted successfully',
    data: result,
  });
});

const PlayerBookmarkController = {
  createPlayerBookmark,
  getMyPlayerBookmark,
  deletePlayerBookmark,
};

export default PlayerBookmarkController;
