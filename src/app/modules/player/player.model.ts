import { Schema, model, Types } from 'mongoose';
import { IAddress } from './player.interface';
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
const PlayerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    league: { type: Types.ObjectId, ref: 'League', required: true },
    team: { type: Types.ObjectId, ref: 'Team', required: true },
    position: { type: String, required: true },
    player_image: { type: String, default: '' },
    player_bg_image: { type: String, default: '' },
    totalTips: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, required: true, default: 0 },
    dueAmount: { type: Number, required: true, default: 0 },
    address: {
      type: addressSchema,
    },
  },
  {
    timestamps: true,
  },
);

const Player = model('Player', PlayerSchema);

export default Player;
