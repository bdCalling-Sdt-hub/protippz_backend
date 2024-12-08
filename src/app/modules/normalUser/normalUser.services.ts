/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { INormalUser } from './normalUser.interface';
import NormalUser from './normalUser.model';
import QueryBuilder from '../../builder/QueryBuilder';

const updateUserProfile = async (id: string, payload: Partial<INormalUser>) => {
  console.log(payload);
  if (payload.email || payload.username) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not change the email or username',
    );
  }

  if (payload.totalAmount || payload.totalPoint) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'If you want to add total amount or total point manually we will block you',
    );
  }
  const user = await NormalUser.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }
  const result = await NormalUser.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const getAllNormalUser = async (query: Record<string, any>) => {
  const normalUserQury = new QueryBuilder(NormalUser.find(), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await normalUserQury.countTotal();
  const result = await normalUserQury.modelQuery;

  return {
    meta,
    result,
  };
};

const NormalUserServices = {
  updateUserProfile,
  getAllNormalUser,
};

export default NormalUserServices;
