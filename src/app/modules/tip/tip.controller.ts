import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import TipServices from './tip.services';

const createTip = catchAsync(async (req, res) => {
  const { entityId, entityType, amount } = req.body;
  const result = await TipServices.createTipIntoDB(
    req?.user?.profileId,
    entityId,
    entityType,
    amount,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Tip created successfully',
    data: result,
  });
});

// Get all tips
const getAllTips = catchAsync(async (req, res) => {
  const result = await TipServices.getAllTipsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All tips retrieved successfully',
    data: result,
  });
});

// Get all tips for the current user
const getUserTips = catchAsync(async (req, res) => {
  const result = await TipServices.getUserTipsFromDB(req?.user?.profileId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User tips retrieved successfully',
    data: result,
  });
});

// Get a single tip by ID
const getSingleTip = catchAsync(async (req, res) => {
  const result = await TipServices.getSingleTipFromDB(req?.params?.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Tip retrieved successfully',
    data: result,
  });
});

const TipController = {
  createTip,
  getAllTips,
  getUserTips,
  getSingleTip,
};

export default TipController;
