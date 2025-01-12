/* eslint-disable no-console */
import httpStatus from 'http-status';
import AppError from '../error/appError';
import NormalUser from '../modules/normalUser/normalUser.model';
import { ENUM_PAYMENT_PURPOSE } from '../utilities/enum';

const handlePaymentSuccess = async (userId: string, paymentPurpose: string) => {
  if (paymentPurpose == ENUM_PAYMENT_PURPOSE.PURCHASE_SUBSCRIPTION) {
    await handleSubcriptionPurchaseSuccess(userId);
  } else if (paymentPurpose == ENUM_PAYMENT_PURPOSE.RENEW_SUBSCRIPTION) {
    await handleSubscriptionRenewSuccess(userId);
  } else if (paymentPurpose == ENUM_PAYMENT_PURPOSE.COLLABRATE_PAYMENT) {
    await handleCollabratePaymentSuccess(userId);
  }
};

const handleSubcriptionPurchaseSuccess = async (userId: string) => {
  const normalUser = await NormalUser.findById(userId);
  if (!normalUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  await NormalUser.findByIdAndUpdate(
    userId,
    {
      subscriptionPurchaseDate: new Date(),
      subscriptionExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isPremium: true,
    },
    { new: true, runValidators: true },
  );
};

const handleSubscriptionRenewSuccess = async (userId: string) => {
  const normalUser = await NormalUser.findById(userId);
  if (!normalUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  await NormalUser.findByIdAndUpdate(
    userId,
    {
      subscriptionExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subscriptionRenewDate: new Date(),
    },
    { new: true, runValidators: true },
  );
};

const handleCollabratePaymentSuccess = async (userId: string) => {
  console.log(userId);
};

export default handlePaymentSuccess;
