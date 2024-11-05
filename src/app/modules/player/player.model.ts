import { Schema, model, Types } from 'mongoose';

const PlayerSchema = new Schema({
  name: { type: String, required: true },
  league: { type: Types.ObjectId, ref: 'League', required: true },
  team: { type: Types.ObjectId, ref: 'Team', required: true },
  position: { type: String, required: true },
  image: { type: String, default:""  },
  bgImage: { type: String, default:"" },
  totalTips: { type: Number, required: true, default: 0 },
  paidAmount: { type: Number, required: true, default: 0 },
  dueAmount: { type: Number, required: true, default: 0 },
});


const Player = model('Player', PlayerSchema);

export default Player;
