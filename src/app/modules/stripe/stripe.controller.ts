import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import StripeService from './stripe.service';

const createLinkToken = catchAsync(async (req, res) => {
  const result = await StripeService.createLinkToken(req.user);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Link token cretaed successfully',
    data: result,
  });
});
const exchangePublicToken = catchAsync(async (req, res) => {
  const result = await StripeService.exchangePublicToken(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Public token exchanged successfully',
    data: result,
  });
});
const createConnectedAccount = catchAsync(async (req, res) => {
  const result = await StripeService.createConnectedAccount(req.user, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Bank account added successfully',
    data: result,
  });
});

const linkBankAccount = catchAsync(async (req, res) => {
  const result = await StripeService.linkBankAccount(req.user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bank Account successfully linked',
    data: result,
  });
});

const createOnboardingLink = catchAsync(async (req, res) => {
  const result = await StripeService.createConnectedAccountAndOnboardingLink(
    req.user,
    req.user.profileId,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Link created successfully',
    data: result,
  });
});
const updateOnboardingLink = catchAsync(async (req, res) => {
  const result = await StripeService.updateOnboardingLink(
    req.body.stripAccountId,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Link created successfully',
    data: result,
  });
});
const StripeController = {
  createLinkToken,
  linkBankAccount,
  exchangePublicToken,
  createConnectedAccount,
  createOnboardingLink,
  updateOnboardingLink,
};

export default StripeController;
