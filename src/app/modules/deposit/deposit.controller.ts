import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import depositServices from './deposit.service';

const depositAmount = catchAsync(async (req, res) => {
  const result = await depositServices.depositAmount(req.user, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Deposit intent created successfully',
    data: result,
  });
});

const executeDepositWithStripe = catchAsync(async (req, res) => {
  const result = await depositServices.executeStripeDeposit(
    req.body.transactionId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Your deposit successful',
    data: result,
  });
});

const executePaypalDeposit = catchAsync(async (req, res) => {
  const result = await depositServices.executePaypalDeposit(
    req.body.paymentId,
    req.body.payerId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Your deposit successful',
    data: result,
  });
});

const DepositController = {
  depositAmount,
  executeDepositWithStripe,
  executePaypalDeposit,
};

export default DepositController;
