import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import userServices from './user.services';



const verifyCode = catchAsync(async (req, res) => {
  const result = await userServices.verifyCode(
    req?.body?.phoneNumber,
    req?.body?.verifyCode,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Successfully verified your account with phone number',
    data: result,
  });
});
const resendVerifyCode = catchAsync(async (req, res) => {
  const result = await userServices.resendVerifyCode(req?.body?.phoneNumber);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Verify code send to your message inbox ',
    data: result,
  });
});

const userController = {
  verifyCode,
  resendVerifyCode,
};
export default userController;
