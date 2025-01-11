import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import StripeService from './stripe.service';

const exchangePublicToken = catchAsync(async (req, res) => {
  const result = await StripeService.exchangePublicToken(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Public token exchanged successfully',
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

const StripeController = {
  linkBankAccount,
  exchangePublicToken,
};

export default StripeController;
