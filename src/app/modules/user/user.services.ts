/* eslint-disable no-unused-vars */

import { User } from './user.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import sendSMS from '../../helper/sendSms';

const generateVerifyCode = (): number => {
  return Math.floor(10000 + Math.random() * 90000);
};





const verifyCode = async (phoneNumber: string, verifyCode: number) => {
  const user = await User.findOne({ phoneNumber: phoneNumber });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (user.codeExpireIn < new Date(Date.now())) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Verify code is expired');
  }
  let result;
  if (user.verifyCode === verifyCode) {
    result = await User.findOneAndUpdate(
      { phoneNumber: phoneNumber },
      { isVerified: true },
      { new: true, runValidators: true },
    );
  }
  return result;
};

const resendVerifyCode = async (phoneNumber: string) => {
  const user = await User.findOne({ phoneNumber: phoneNumber });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const verifyCode = generateVerifyCode();
  const updateUser = await User.findOneAndUpdate(
    { phoneNumber: phoneNumber },
    { verifyCode: verifyCode, codeExpireIn: new Date(Date.now() + 5 * 60000) },
  );
  const smsMessage = `Your verification code is: ${updateUser?.verifyCode}`;
  await sendSMS(user?.phoneNumber, smsMessage);
};

const userServices = {
  verifyCode,
  resendVerifyCode,
};

export default userServices;
