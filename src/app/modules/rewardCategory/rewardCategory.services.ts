/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IRewordCategory } from './rewardCategory.interface';
import RewardCategory from './rewardCategory.model';
import QueryBuilder from '../../builder/QueryBuilder';
import Reward from '../reward/reward.model';
import mongoose from 'mongoose';

const createRewardCategoryIntoDB = async ( payload: IRewordCategory) => {
  const result = await RewardCategory.create(payload);
  return result;
};

const updateRewardCategoryIntoDB = async (
  id: string,
  payload: Partial<IRewordCategory>,
) => {

  const category = await RewardCategory.findById(id);
  if(!category){
    throw new AppError(httpStatus.NOT_FOUND,"Not found");
  }

  const result = await RewardCategory.findOneAndUpdate(
    { _id: id,},
    payload,
    { new: true, runValidators: true },
  );
  return result;
};

const getAllRewardCategories = async (query:Record<string,any>) => {

  const rewardCategoryQuery = new QueryBuilder(
    RewardCategory.find(),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await rewardCategoryQuery.countTotal();
  const result = await rewardCategoryQuery.modelQuery;

  return {
    meta,
    result,
  };
};

// get single category 


const getSingleRewardCategoryFromDB = async(id:string)=>{
  const result = await RewardCategory.findById(id);
  if(!result){
    throw new AppError(httpStatus.NOT_FOUND,"Reward category not found")
  }
  return result;
}



// delete category
const deleteRewardCategoryFromDB = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const rewardCategory = await RewardCategory.findById(id).session(session);
    if (!rewardCategory) {
      throw new AppError(httpStatus.NOT_FOUND, "Reward Category not found");
    }

    await RewardCategory.findByIdAndDelete(id).session(session);
    await Reward.deleteMany({ category: id }).session(session);

    await session.commitTransaction();
    session.endSession();
    return rewardCategory;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


const RewardCategoryService = {
  createRewardCategoryIntoDB,
  updateRewardCategoryIntoDB,
  getAllRewardCategories,
  deleteRewardCategoryFromDB,
  getSingleRewardCategoryFromDB
};

export default RewardCategoryService;
