import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import RedeemRequestService from './redeemRequest.services';

const createRedeemRequest = catchAsync(async (req, res) => {
  const result = await RedeemRequestService.createRedeemRequestIntoDB(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Redeem request created successfully',
    data: result,
  });
});
const verifyCodeForRedeem = catchAsync(async (req, res) => {
  const result = await RedeemRequestService.verifyEmailForRedeem(
    req.user.profileId,
    req.params.id,
    req.body.verifyCode,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Email verified successfully',
    data: result,
  });
});
// get all redeem request
const getAllRedeemRequest = catchAsync(async (req, res) => {
  const result = await RedeemRequestService.getAllRedeemRequestFromDB(
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Redeem request retrieved successfully',
    data: result,
  });
});
// get may redeem request
const getMyRedeem = catchAsync(async (req, res) => {
  const result = await RedeemRequestService.getMyRedeemFromDB(
    req.user.profileId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Redeem request retrieved successfully',
    data: result,
  });
});

const RedeemRequestController = {
  createRedeemRequest,
  verifyCodeForRedeem,
  getAllRedeemRequest,
  getMyRedeem
};

export default RedeemRequestController;
