/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IReward } from './reward.interface';
import Reward from './reward.model';
import QueryBuilder from '../../builder/QueryBuilder';
import RewardCategory from '../rewardCategory/rewardCategory.model';

const createRewardIntoDB = async (payload: IReward) => {
  const rewardCategory = await RewardCategory.findById(payload.category);
  if (!rewardCategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category does not exits');
  }

  const result = await Reward.create(payload);
  return result;
};

const getAllRewardsFromDB = async (query: Record<string, any>) => {
  const rewardQuery = new QueryBuilder(Reward.find(), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await rewardQuery.countTotal();
  const result = await rewardQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getSingleRewardFromDB = async (id: string) => {
  const reward = await Reward.findById(id).populate('category', 'name');
  if (!reward) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reward not found');
  }
  return reward;
};

const updateRewardIntoDB = async (id: string, payload: Partial<IReward>) => {
  const reward = await Reward.findById(id);
  if (!reward) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reward not found');
  }
  const result = await Reward.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteRewardFromDB = async (id: string) => {
  const reward = await Reward.findById(id);
  if (!reward) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reward not found');
  }

  const result = await Reward.findByIdAndDelete(id);

  return result;
};

const RewardServices = {
  createRewardIntoDB,
  getAllRewardsFromDB,
  getSingleRewardFromDB,
  updateRewardIntoDB,
  deleteRewardFromDB,
};

export default RewardServices;
