import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Tip from './tip.model';

const createTipIntoDB = async (userId: string, entityId: string, entityType: 'Team' | 'Player', amount: number) => {
  const result = await Tip.create({
    user: userId,
    entityId,
    entityType,
    amount,
  });
  return result;
};

// Get all tips
const getAllTipsFromDB = async () => {
  const result = await Tip.find();
  return result;
};

// Get all tips for a specific user
const getUserTipsFromDB = async (userId: string) => {
  const result = await Tip.find({ user: userId });
  return result;
};

// Get a single tip by ID
const getSingleTipFromDB = async (tipId: string) => {
  const tip = await Tip.findById(tipId);

  if (!tip) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tip not found');
  }

  return tip;
};

const TipServices = {
  createTipIntoDB,
  getAllTipsFromDB,
  getUserTipsFromDB,
  getSingleTipFromDB,
};

export default TipServices;
