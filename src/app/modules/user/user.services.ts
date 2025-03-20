/* eslint-disable no-unused-vars */

import { User } from './user.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { INormalUser } from '../normalUser/normalUser.interface';
import mongoose from 'mongoose';
import { TUser, TUserRole } from './user.interface';
import { USER_ROLE } from './user.constant';
import NormalUser from '../normalUser/normalUser.model';
import registrationSuccessEmailBody from '../../mailTemplate/registerSucessEmail';
import cron from 'node-cron';
import sendEmail from '../../utilities/sendEmail';
import { JwtPayload } from 'jsonwebtoken';
import Player from '../player/player.model';
import Team from '../team/team.model';
import Invite from '../invite/invite.model';
import { inviteRewardPoint } from '../../constant';
import Notification from '../notification/notification.model';
// import Stripe from 'stripe';
import config from '../../config';
import { createToken } from './user.utils';
import SuperAdmin from '../superAdmin/superAdmin.model';
import addEmailVerifiedCode from '../../mailTemplate/addEmailVerification';
// const stripe = new Stripe(config.stripe.stripe_secret_key as string);
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
      codeExpireIn: new Date(Date.now() + 2 * 60000),
      inviteToken: userData.inviteToken ? userData.inviteToken : '',
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
  if (verifyCode !== user.verifyCode) {
    throw new AppError(httpStatus.BAD_REQUEST, "Code doesn't match");
  }
  const result = await User.findOneAndUpdate(
    { email: email },
    { isVerified: true },
    { new: true, runValidators: true },
  );

  // for create stripe customer ================
  // const customer = await stripe.customers.create({
  //   email: result?.email,
  // });
  // await User.findByIdAndUpdate(
  //   result?.id,
  //   {
  //     stripeCustomerId: customer.id,
  //   },
  //   { new: true, runValidators: true },
  // );
  //=====================================
  if (result?.inviteToken) {
    const invite = await Invite.findOne({ inviteToken: result.inviteToken });
    console.log('Invite token', invite);
    const updatedUser = await NormalUser.findByIdAndUpdate(
      invite?.inviter,
      {
        $inc: { totalPoint: inviteRewardPoint },
      },
      { new: true, runValidators: true },
    );
    console.log('updated user', updatedUser);
    const notificationData = {
      title: 'Congratulations you got points',
      message: `Congratulations your friend register with your invitation and you got ${inviteRewardPoint} points`,
      receiver: updatedUser?._id,
    };

    await Notification.create(notificationData);
  }
  const jwtPayload = {
    id: user?._id,
    username: user.username,
    email: user?.email,
    role: user?.role as TUserRole,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );
  return {
    accessToken,
    refreshToken,
  };
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
    { new: true, runValidators: true },
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

const getMyProfile = async (userData: JwtPayload) => {
  let result = null;
  if (userData.role === USER_ROLE.user) {
    result = await NormalUser.findOne({ email: userData.email }).populate({
      path: 'user',
      select: 'role -_id',
    });
  } else if (userData.role === USER_ROLE.player) {
    result = await Player.findById(userData?.profileId)
      .populate({
        path: 'user',
        select: 'role email -_id',
      })
      .populate({ path: 'team', select: 'name' });
  } else if (userData.role === USER_ROLE.team) {
    result = await Team.findById(userData?.profileId)
      .populate({
        path: 'user',
        select: 'role email -_id',
      })
      .populate({ path: 'league', select: 'name' });
  } else if (userData.role === USER_ROLE.superAdmin) {
    result = await SuperAdmin.findOne({
      $or: [{ email: userData?.email }, { username: userData?.username }],
    }).populate({
      path: 'user',
      select: 'role -_id',
    });
  }
  return result;
};

// delete account
const deleteUserAccount = async (user: JwtPayload, password: string) => {
  const userData = await User.findById(user.id);

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (!(await User.isPasswordMatched(password, userData?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
  }

  await NormalUser.findByIdAndDelete(user.profileId);
  await User.findByIdAndDelete(user.id);

  return null;
};

// add email for account
const addEmailAddress = async (userData: JwtPayload, email: string) => {
  const verifyCode = generateVerifyCode();
  const user = await User.findOne({ email: email });
  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This email already exits');
  }
  const result = await User.findByIdAndUpdate(
    userData.id,
    {
      email: email,
      addEmailVerifiedCode: verifyCode,
      codeExpireIn: new Date(Date.now() + 5 * 60000),
    },
    { new: true, runValidators: true },
  );
  sendEmail({
    email: email,
    subject: 'Verify your email',
    html: addEmailVerifiedCode(result?.username as string, verifyCode),
  });
  return result;
};

// verify add email
const verifyAddEmail = async (email: string, verifyCode: number) => {
  const user = await User.findOne({ email: email });
  if (user?.addEmailVerifiedCode !== verifyCode) {
    throw new AppError(httpStatus.NO_CONTENT, 'Verify code do not match');
  }
  const result = await User.findOneAndUpdate(
    { email: email },
    { isAddEmailVerified: true },
    { new: true, runValidators: true },
  );
  return result;
};

// all cron jobs for users

cron.schedule('*/2 * * * *', async () => {
  try {
    const now = new Date();

    // Find unverified users whose expiration time has passed
    const expiredUsers = await User.find({
      isVerified: false,
      codeExpireIn: { $lte: now },
    });

    if (expiredUsers.length > 0) {
      const expiredUserIds = expiredUsers.map((user) => user._id);

      // Delete corresponding NormalUser documents
      const normalUserDeleteResult = await NormalUser.deleteMany({
        user: { $in: expiredUserIds },
      });

      // Delete the expired User documents
      const userDeleteResult = await User.deleteMany({
        _id: { $in: expiredUserIds },
      });

      console.log(
        `Deleted ${userDeleteResult.deletedCount} expired inactive users`,
      );
      console.log(
        `Deleted ${normalUserDeleteResult.deletedCount} associated NormalUser documents`,
      );
    }
  } catch (error) {
    console.log('Error deleting expired users and associated data:', error);
  }
});

// crone for remove email
cron.schedule('*/2 * * * *', async () => {
  try {
    const now = new Date();

    // Find unverified users whose expiration time has passed
    const expiredUsers = await User.find({
      isAddEmailVerified: false,
      $or: [{ role: USER_ROLE.player }, { role: USER_ROLE.team }],
      codeExpireIn: { $lte: now },
    });
    if (expiredUsers.length > 0) {
      const expiredUserIds = expiredUsers.map((user) => user._id);

      // Remove email field from the expired users
      const updateResult = await User.updateMany(
        { _id: { $in: expiredUserIds } },
        { $unset: { email: '' } },
      );
      console.log(
        `Updated ${updateResult.modifiedCount} user(s) by removing the email field.`,
      );
    }
  } catch (error) {
    console.log('Error updating expired users:', error);
  }
});

const changeUserStatus = async (id: string, status: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const result = await User.findByIdAndUpdate(
    id,
    { status: status },
    { new: true, runValidators: true },
  );
  return result;
};

const userServices = {
  registerUser,
  verifyCode,
  resendVerifyCode,
  getMyProfile,
  changeUserStatus,
  deleteUserAccount,
  addEmailAddress,
  verifyAddEmail,
};

export default userServices;
