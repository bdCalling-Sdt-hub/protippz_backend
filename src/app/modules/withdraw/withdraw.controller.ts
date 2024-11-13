import httpStatus from "http-status";
import catchAsync from "../../utilities/catchasync";
import sendResponse from "../../utilities/sendResponse";
import WithdrawRequestServices from "./withdraw.service";

const createWithdrawRequest = catchAsync(async (req, res) => {
    const result = await WithdrawRequestServices.crateWithdrawRequest(req.user,req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Withdraw request send successfully',
      data: result,
    });
  });
const getAllWithdrawRequest = catchAsync(async (req, res) => {
    const result = await WithdrawRequestServices.getAllWithdrawRequest(req.query)
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Withdraw request retrieved successfully',
      data: result,
    });
  });


const WithdrawRequestController = {
    createWithdrawRequest,
    getAllWithdrawRequest
}

export default WithdrawRequestController;