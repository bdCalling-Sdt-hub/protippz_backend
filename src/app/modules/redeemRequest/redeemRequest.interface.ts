import { Types } from 'mongoose';
import { ENUM_REDEEM_STATUS } from '../../utilities/enum';

export interface IRedeemRequest {
  reward: Types.ObjectId;
  category: Types.ObjectId;
  redeemedPoint: number;
  user: Types.ObjectId;
  email: string;
  userName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  isVerified: true | false;
  verifyCode: number;
  status: (typeof ENUM_REDEEM_STATUS)[keyof typeof ENUM_REDEEM_STATUS];
}
