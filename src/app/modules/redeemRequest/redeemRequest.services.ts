/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ENUM_DELIVERY_OPTION } from '../../utilities/enum';
import RewardCategory from '../rewardCategory/rewardCategory.model';
import { IRedeemRequest } from './redeemRequest.interface';
import Reward from '../reward/reward.model';
import NormalUser from '../normalUser/normalUser.model';
import RedeemRequest from './redeemRequest.model';
import sendEmail from '../../utilities/sendEmail';
import cron from 'node-cron';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLE } from '../user/user.constant';
import Notification from '../notification/notification.model';
const generateVerifyCode = (): number => {
  return Math.floor(10000 + Math.random() * 90000);
};
const createRedeemRequestIntoDB = async (
  userId: string,
  payload: IRedeemRequest,
) => {
  const category = await RewardCategory.findById(payload.category);
  if (category?.deliveryOption === ENUM_DELIVERY_OPTION.EMAIL) {
    if (!payload.email) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Email is required for redeem this reward',
      );
    }
  }

  if (category?.deliveryOption === ENUM_DELIVERY_OPTION.SHIPPING_ADDRESS) {
    if (
      !payload.city ||
      !payload.phone ||
      !payload.state ||
      !payload.streetAddress ||
      !payload.userName ||
      !payload.zipCode
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Missing information for redeem this reward',
      );
    }
  }

  const reward = await Reward.findById(payload.reward);
  if (!reward) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Reward not found');
  }

  const user = await NormalUser.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Unauthorized access');
  }
  if (user?.totalPoint < reward.pointRequired) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You don't have enough point for redeem this reward",
    );
  }

  payload.redeemedPoint = reward.pointRequired;
  payload.isVerified = payload.email && !payload.state ? false : true;
  payload.verifyCode = generateVerifyCode();

  const result = await RedeemRequest.create({ ...payload, user: userId });

  const updatedUser = await NormalUser.findByIdAndUpdate(userId, {
    $inc: { totalPoint: -reward.pointRequired },
  });

  const notificationData = [
    {
      title: 'User sent redeem request please check',
      message: `A user sent reward redeem request . Please check it and make ready for send`,
      receiver: USER_ROLE.superAdmin,
    },
    {
      title: 'Redeem request sent successfully',
      message: `Your reward redeem request sent successfully . We will shortly send you the reward`,
      receiver: updatedUser?._id,
    },
  ];

  await Notification.create(notificationData);

  const html = `
  <h1>Protipzz Reward Redeem Verification</h1>
  <p>Hello,</p>
  <p>Thank you for redeeming your reward at Protipzz!</p>
  <p>Please use the verification code below to verify your request:</p>
  <h2>${payload.verifyCode}</h2>
  <p>If you didn't request this, please ignore this email.</p>
  <p>Thank you,<br/>The Protipzz Team</p>
`;

  if (payload.email) {
    sendEmail({
      email: payload.email,
      subject: 'Please verify your email for redeem reward',
      html: html,
    });
  }

  return result;
};

const verifyEmailForRedeem = async (
  userId: string,
  id: string,
  verifyCode: number,
) => {
  const redeemRequest = await RedeemRequest.findOne({ user: userId, _id: id });

  if (!redeemRequest) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You don't have any unverified redeem request",
    );
  }
  if (redeemRequest.verifyCode !== verifyCode) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Code not matched');
  }

  const result = await RedeemRequest.findOneAndUpdate(
    { user: userId, _id: id },
    { isVerified: true },
    { new: true, runValidators: true },
  );

  return result;
};

// get all redeem request
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllRedeemRequestFromDB = async (query: Record<string, any>) => {
  const redeemRequestQuery = new QueryBuilder(
    RedeemRequest.find({ isVerified: true })
      .populate({ path: 'user', select: 'name profile_image phone' })
      .populate({ path: 'reward', select: 'name' })
      .populate({ path: 'category', select: 'name' }),
    query,
  )
    .search(['reward.name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await redeemRequestQuery.countTotal();
  const result = await redeemRequestQuery.modelQuery;

  return {
    meta,
    result,
  };
};

// get my redeem
const getMyRedeemFromDB = async (
  userId: string,
  query: Record<string, any>,
) => {
  const redeemRequestQuery = new QueryBuilder(
    RedeemRequest.find({ user: userId })
      .populate({ path: 'user', select: 'name profile_image phone' })
      .populate({ path: 'reward', select: 'name' })
      .populate({ path: 'category', select: 'name' }),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await redeemRequestQuery.countTotal();
  const result = await redeemRequestQuery.modelQuery;

  return {
    meta,
    result,
  };
};

// change redeem request status

const changeRedeemRequestStatus = async (id: string, status: string) => {
  const redeemRequest = await RedeemRequest.findById(id);
  if (!redeemRequest) {
    throw new AppError(httpStatus.NOT_FOUND, 'Redeem Request not found');
  }

  const result = await RedeemRequest.findByIdAndUpdate(
    id,
    { status: status },
    { new: true, runValidators: true },
  );

  return result;
};

// crone jobs
cron.schedule('*/5 * * * *', async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const oldRequests = await RedeemRequest.find({
      isVerified: false,
      createdAt: { $lt: fiveMinutesAgo },
    });

    for (const request of oldRequests) {
      const user = await NormalUser.findById(request.user);

      if (user) {
        user.totalPoint = (user.totalPoint || 0) + request.redeemedPoint;
        await user.save();
        console.log(
          `Added ${request.redeemedPoint} points to user ${user._id}`,
        );
      }

      await RedeemRequest.deleteOne({ _id: request._id });
      console.log(`Deleted redeem request ${request._id}`);
    }

    console.log(
      `Processed and deleted ${oldRequests.length} pending redeem requests older than 5 minutes`,
    );
  } catch (error) {
    console.error('Error processing old redeem requests:', error);
  }
});

const RedeemRequestService = {
  createRedeemRequestIntoDB,
  verifyEmailForRedeem,
  getAllRedeemRequestFromDB,
  getMyRedeemFromDB,
  changeRedeemRequestStatus,
};

export default RedeemRequestService;
