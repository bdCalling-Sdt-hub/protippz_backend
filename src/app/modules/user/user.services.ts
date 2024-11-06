/* eslint-disable no-unused-vars */

import { User } from './user.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { INormalUser } from '../normalUser/normalUser.interface';
import mongoose from 'mongoose';
import { TUser } from './user.interface';
import { USER_ROLE } from './user.constant';
import NormalUser from '../normalUser/normalUser.model';
import registrationSuccessEmailBody from '../../mailTemplate/registerSucessEmail';
import cron from 'node-cron';
import sendEmail from '../../utilities/sendEmail';
const generateVerifyCode = (): number => {
  return Math.floor(10000 + Math.random() * 90000);
};

const registerUser = async (
  password: string,
  confirmPassword: string,
  userData: INormalUser,
) => {
  if (password !== confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password and confirm password doesn't match",
    );
  }

  if (userData.totalAmount || userData.totalPoint) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'If you want to add total amount or total point manually we will block you',
    );
  }
  const usernameExist = await User.findOne({ username: userData.username });
  if (usernameExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This username already exist');
  }
  const emailExist = await User.findOne({ email: userData.email });
  if (emailExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This email already exist');
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const verifyCode = generateVerifyCode();
    const userDataPayload: Partial<TUser> = {
      username: userData.username,
      email: userData?.email,
      phone: userData?.phone,
      password: password,
      role: USER_ROLE.user,
      verifyCode,
      codeExpireIn: new Date(Date.now() + 5 * 60000),
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await User.create([userDataPayload], { session });

    const normalUserPayload = {
      ...userData,
      user: user[0]._id,
    };
    const result = await NormalUser.create([normalUserPayload], { session });

    sendEmail({
      email: userData.email,
      subject: 'Activate Your Account',
      html: registrationSuccessEmailBody(result[0].name, user[0].verifyCode),
    });

    await session.commitTransaction();
    session.endSession();

    return result[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const verifyCode = async (email: string, verifyCode: number) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (user.codeExpireIn < new Date(Date.now())) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Verify code is expired');
  }
  if(verifyCode !== user.verifyCode){
    throw new AppError(httpStatus.BAD_REQUEST,"Code doesn't match")
  }
  const result = await User.findOneAndUpdate(
    { email: email },
    { isVerified: true },
    { new: true, runValidators: true },
  );

  return result;
};

const resendVerifyCode = async (email: string) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const verifyCode = generateVerifyCode();
  const updateUser = await User.findOneAndUpdate(
    { email: email },
    { verifyCode: verifyCode, codeExpireIn: new Date(Date.now() + 5 * 60000) },
  );
  if (!updateUser) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Something went wrong . Please again resend the code after a few second',
    );
  }
  sendEmail({
    email: user.email,
    subject: 'Activate Your Account',
    html: registrationSuccessEmailBody(
      updateUser.username,
      updateUser.verifyCode,
    ),
  });
  return null;
};

cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const result = await User.deleteMany({
      isVerified: false,
      expirationTime: { $lte: now },
    });
    if (result.deletedCount > 0) {
      console.log(`Deleted ${result.deletedCount} expired inactive users`);
    }
  } catch (error) {
    console.log('Error deleting expired users:', error);
  }
});

const userServices = {
  registerUser,
  verifyCode,
  resendVerifyCode,
};

export default userServices;
