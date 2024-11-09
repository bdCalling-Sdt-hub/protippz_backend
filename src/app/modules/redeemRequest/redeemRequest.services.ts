import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ENUM_DELIVERY_OPTION } from '../../utilities/enum';
import RewardCategory from '../rewardCategory/rewardCategory.model';
import { IRedeemRequest } from './redeemRequest.interface';
import Reward from '../reward/reward.model';
import NormalUser from '../normalUser/normalUser.model';
import RedeemRequest from './redeemRequest.model';
import sendEmail from '../../utilities/sendEmail';
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
  if (user?.totalAmount < reward.pointRequired) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You don't have enough point for redeem this reward",
    );
  }

  payload.redeemedPoint = reward.pointRequired;
  payload.isVerified = payload.email && !payload.state ? false : true;
  payload.verifyCode = generateVerifyCode();

  const result = await RedeemRequest.create({ ...payload, user: userId });

  await NormalUser.findByIdAndUpdate(userId, {
    $inc: { totalPoint: -reward.pointRequired },
  });

  const html = `
  <h1>Protipzz Reward Redemption Verification</h1>
  <p>Hello,</p>
  <p>Thank you for redeeming your reward at Protipzz!</p>
  <p>Please use the verification code below to verify your request:</p>
  <h2>${payload.verifyCode}</h2>
  <p>If you didn't request this, please ignore this email.</p>
  <p>Thank you,<br/>The Protipzz Team</p>
`;

  if (payload.email) {
    sendEmail({
      email: user.email,
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

const RedeemRequestService = {
  createRedeemRequestIntoDB,
  verifyEmailForRedeem,
};

export default RedeemRequestService;
