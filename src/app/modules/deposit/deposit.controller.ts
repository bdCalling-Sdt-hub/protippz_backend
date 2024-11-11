import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import depositServices from './deposit.service';

const depositAmount = catchAsync(async (req, res) => {
  const result = await depositServices.depositAmount(req.user, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Your deposit successful',
    data: result,
  });
});

const DepositController = {
  depositAmount,
};

export default DepositController;
