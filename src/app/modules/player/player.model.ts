import { Schema, model, Types } from 'mongoose';

const PlayerSchema = new Schema({
  user:{type:Schema.Types.ObjectId,ref:"User"},
  name: { type: String, required: true },
  league: { type: Types.ObjectId, ref: 'League', required: true },
  team: { type: Types.ObjectId, ref: 'Team', required: true },
  position: { type: String, required: true },
  player_image: { type: String, default:""  },
  player_bg_image: { type: String, default:"" },
  totalTips: { type: Number, required: true, default: 0 },
  paidAmount: { type: Number, required: true, default: 0 },
  dueAmount: { type: Number, required: true, default: 0 },
},{
  timestamps:true
});


const Player = model('Player', PlayerSchema);

export default Player;
