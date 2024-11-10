import { Schema, model } from 'mongoose';
import { IRedeemRequest } from './redeemRequest.interface';
import { ENUM_REDEEM_STATUS } from '../../utilities/enum';

const redeemRequestSchema = new Schema<IRedeemRequest>(
  {
    reward: { type: Schema.Types.ObjectId, ref: 'Reward', required: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'RewardCategory',
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: 'NormalUser', required: true },
    redeemedPoint: { type: Number, required: true },
    email: { type: String },
    userName: { type: String },
    phone: { type: String },
    streetAddress: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    isVerified: { type: Boolean, default: false },
    verifyCode: { type: Number },
    status: {
      type: String,
      enum: Object.values(ENUM_REDEEM_STATUS),
      default: ENUM_REDEEM_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  },
);

const RedeemRequest = model<IRedeemRequest>(
  'RedeemRequest',
  redeemRequestSchema,
);

export default RedeemRequest;
