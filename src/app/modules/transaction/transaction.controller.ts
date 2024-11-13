import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import transactionServices from './transaction.service';

const getAllTransaction = catchAsync(async (req, res) => {
  const result = await transactionServices.getAllTransactionFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transaction retrieved successfully',
    data: result,
  });
});
const getMyTransaction = catchAsync(async (req, res) => {
  const result = await transactionServices.getMyTransactionFromDB(
    req.user.profileId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transaction retrieved successfully',
    data: result,
  });
});

const TransactionController = {
  getAllTransaction,
  getMyTransaction,
};

export default TransactionController;
