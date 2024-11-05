import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import TeamBookmarkServices from './team.bookmark.services';

const createBookmark = catchAsync(async (req, res) => {
  const result = await TeamBookmarkServices.createBookmarkIntoDB(
    req?.body?.teamId,
    req?.user?.profileId,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Bookmark created successfully',
    data: result,
  });
});
// get my bookmark
const getMyBookmark = catchAsync(async (req, res) => {
  const result = await TeamBookmarkServices.getMyBookmarkFromDB(
    req?.user?.profileId,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Bookmark retrieved successfully',
    data: result,
  });
});
// delete bookmark
const deleteBookmark = catchAsync(async (req, res) => {
  const result = await TeamBookmarkServices.deleteBookmarkFromDB(
    req?.params?.id,
    req?.user?.profileId,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Bookmark deleted successfully',
    data: result,
  });
});

const TeamBookmarkController = {
  createBookmark,
  getMyBookmark,
  deleteBookmark,
};

export default TeamBookmarkController;
