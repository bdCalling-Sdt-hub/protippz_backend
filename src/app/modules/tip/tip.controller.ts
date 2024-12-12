import { string } from 'joi';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import TipServices from './tip.services';

const createTip = catchAsync(async (req, res) => {
  const result = await TipServices.createTipIntoDB(
    req?.user?.profileId,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Tip created successfully',
    data: result,
  });
});

// make payment success for tip
const paymentSuccessWithStripe = catchAsync(async (req, res) => {
  const result = await TipServices.paymentSuccessWithStripe(
    req.body.transactionId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Tip send successfully',
    data: result,
  });
});
const executePaypalPayment = catchAsync(async (req, res) => {
  const result = await TipServices.executePaymentWithPaypal(
    req.body.paymentId,
    req.body.payerId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Tip updated successfully',
    data: result,
  });
});

// Get all tips
const getAllTips = catchAsync(async (req, res) => {
  const result = await TipServices.getAllTipsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All tips retrieved successfully',
    data: result,
  });
});

// Get all tips for the current user
const getUserTips = catchAsync(async (req, res) => {
  const result = await TipServices.getUserTipsFromDB(
    req?.user?.profileId,
    req.query,
  );

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

const executeDepositPaymentWithApp = catchAsync(async (req, res) => {
  const result = await TipServices.executePaypalTipPaymentWithApp(
    req.user.profileId,
    req.body.paymentId,
    req.body.payerId,
    req.body.entityId,
    req.body.entityType,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Tip send successfully',
    data: result,
  });
});

const TipController = {
  createTip,
  getAllTips,
  getUserTips,
  getSingleTip,
  paymentSuccessWithStripe,
  executePaypalPayment,
  executeDepositPaymentWithApp,
};

export default TipController;
