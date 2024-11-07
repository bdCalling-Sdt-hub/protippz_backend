import httpStatus from "http-status";
import sendResponse from "../../utilities/sendResponse";
import RewardServices from "./reward.services";
import catchAsync from "../../utilities/catchasync";

const createReward = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'reward_image' in files) {
    req.body.reward_image = files['reward_image'][0].path;
  }
  const result = await RewardServices.createRewardIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Reward created successfully",
    data: result,
  });
});

const getAllRewards = catchAsync(async (req, res) => {
  const result = await RewardServices.getAllRewardsFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rewards retrieved successfully",
    data: result,
  });
});

const getSingleReward = catchAsync(async (req, res) => {
  const result = await RewardServices.getSingleRewardFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reward retrieved successfully",
    data: result,
  });
});

const updateReward = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'reward_image' in files) {
    req.body.reward_image = files['reward_image'][0].path;
  }
  const result = await RewardServices.updateRewardIntoDB(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reward updated successfully",
    data: result,
  });
});

const deleteReward = catchAsync(async (req, res) => {
  const result = await RewardServices.deleteRewardFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reward deleted successfully",
    data: result,
  });
});

const RewardController = {
  createReward,
  getAllRewards,
  getSingleReward,
  updateReward,
  deleteReward,
};

export default RewardController;
