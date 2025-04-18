import { Schema, model, Types } from 'mongoose';
import { addressSchema, taxInfoSchema } from '../player/player.model';

const TeamSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    team_logo: { type: String, default: '' },
    league: { type: Types.ObjectId, ref: 'League', required: true },
    team_bg_image: { type: String, default: '' },
    sport: { type: String },
    totalTips: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
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

TeamSchema.index({ name: 1 }, { background: true });
TeamSchema.index({ sport: 1 }, { background: true });

const Team = model('Team', TeamSchema);

export default Team;
