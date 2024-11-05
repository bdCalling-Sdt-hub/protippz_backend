import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import RewardCategoryService from './rewardCategory.services';

const createCategory = catchAsync(async (req, res) => {
  const result = await RewardCategoryService.createRewardCategoryIntoDB(
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category created successfully',
    data: result,
  });
});

const getAllCategories = catchAsync(async (req, res) => {
  const result = await RewardCategoryService.getAllRewardCategories();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category retrieved successfully',
    data: result,
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const result = await RewardCategoryService.updateRewardCategoryIntoDB(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category updated successfully',
    data: result,
  });
});

// delete category
const deleteCategory = catchAsync(async (req, res) => {
  const result = await RewardCategoryService.deleteRewardCategoryFromDB(
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category deleted successfully',
    data: result,
  });
});

const RewardCategoryController = {
  createCategory,
  updateCategory,
  deleteCategory,

  getAllCategories,
};
export default RewardCategoryController;
