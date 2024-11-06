import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { INormalUser } from './normalUser.interface';
import NormalUser from './normalUser.model';

const updateUserProfile = async (id: string, payload: Partial<INormalUser>) => {
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

const NormalUserServices = {
  updateUserProfile,
};

export default NormalUserServices;
