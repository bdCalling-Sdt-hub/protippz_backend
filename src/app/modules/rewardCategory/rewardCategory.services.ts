import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IRewordCategory } from './rewardCategory.interface';
import RewardCategory from './rewardCategory.model';

const createRewardCategoryIntoDB = async ( payload: IRewordCategory) => {
  const result = await RewardCategory.create(payload);
  return result;
};

const updateRewardCategoryIntoDB = async (
  id: string,
  payload: Partial<IRewordCategory>,
) => {
  const result = await RewardCategory.findOneAndUpdate(
    { _id: id,},
    payload,
    { new: true, runValidators: true },
  );
  return result;
};

const getAllRewardCategories = async () => {
  const result = await RewardCategory.find();
  return result;
};




// delete category
const deleteRewardCategoryFromDB = async (id: string) => {
 const rewardCategory = await RewardCategory.findById(id);
 if(rewardCategory){
  throw new AppError(httpStatus.NOT_FOUND,"Reward Category not found");
 }

 const result = await RewardCategory.findByIdAndDelete(id);
 return result;
};


const RewardCategoryService = {
  createRewardCategoryIntoDB,
  updateRewardCategoryIntoDB,
  getAllRewardCategories,
  deleteRewardCategoryFromDB,
};

export default RewardCategoryService;
