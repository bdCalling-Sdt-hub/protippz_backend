import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import metaServices from './meta.services';

const getAminDashboardMetaData = catchAsync(async (req, res) => {
  const result = await metaServices.getAdminDashboardMetaDataFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dashboard meta data successfully retrieved',
    data: result,
  });
});
// okey perfect------------------
const getTipChartData = catchAsync(async (req, res) => {
  const result = await metaServices.getChartDataForTips(Number(req.query.year));
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Tip chart data retrieved successfully',
    data: result,
  });
});
const getUserChartData = catchAsync(async (req, res) => {
  const result = await metaServices.getUserChartData(Number(req.query.year));
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User chart data retrieved successfully',
    data: result,
  });
});

const metaController = {
  getAminDashboardMetaData,
  getTipChartData,
  getUserChartData,
};

export default metaController;
