import { Schema, model, Types } from 'mongoose';
import { addressSchema, taxInfoSchema } from '../player/player.model';

const TeamSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    team_logo: { type: String, default: '' },
    league: { type: Types.ObjectId, ref: 'League', required: true },
    team_bg_image: { type: String, default: '' },
    sport: { type: String, required: true },
    totalTips: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    address: {
      type: addressSchema,
    },
    taxInfo: {
      type: taxInfoSchema,
    },
  },
  {
    timestamps: true,
  },
);

const Team = model('Team', TeamSchema);

export default Team;
