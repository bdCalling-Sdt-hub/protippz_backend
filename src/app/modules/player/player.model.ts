import { Schema, model, Types } from 'mongoose';
import { IAddress, ITaxInfo } from './player.interface';
import { ENUM_RESIDENTIAL_STATUS } from '../../utilities/enum';
export const addressSchema = new Schema<IAddress>({
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  streetAddress: {
    type: String,
    required: true,
  },
  zipCode: {
    type: Number,
    required: true,
  },
});

export const taxInfoSchema = new Schema<ITaxInfo>({
  fullname: { type: String, required: true },
  taxId: { type: String, required: true },
  address: { type: String, required: true },
  residentialStatus: {
    type: String,
    enum: Object.values(ENUM_RESIDENTIAL_STATUS),
    // required: true,
  },
});

const PlayerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    league: { type: Types.ObjectId, ref: 'League', required: true },
    team: { type: Types.ObjectId, ref: 'Team', required: true },
    position: { type: String },
    player_image: { type: String, default: '' },
    player_bg_image: { type: String, default: '' },
    totalTips: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, required: true, default: 0 },
    dueAmount: { type: Number, required: true, default: 0 },
    address: {
      type: addressSchema,
    },
    taxInfo: {
      type: taxInfoSchema,
    },
    stripe_account_id: {
      type: String,
    },
    stripAccountId: {
      type: String,
    },
    isStripeConnected: {
      type: Boolean,
      default: false,
    },
    jerceyNumber: {
      type: Number,
    },
    experience: {
      type: String,
    },
    username: {
      type: String,
    },
    invitedPassword: {
      type: String,
    },
    email: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

PlayerSchema.index({ name: 1 }, { background: true });
PlayerSchema.index({ position: 1 }, { background: true });

const Player = model('Player', PlayerSchema);

export default Player;
