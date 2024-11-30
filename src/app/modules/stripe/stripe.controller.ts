import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import StripeService from './stripe.service';

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
};

export default StripeController;
