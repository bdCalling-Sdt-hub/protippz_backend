import { Schema, model, Types } from 'mongoose';

const TeamSchema = new Schema({
  name: { type: String, required: true },
  teamLogo: { type: String, default:"" },
  league: { type: Types.ObjectId, ref: 'League', required: true },
  sport: { type: String, required: true },
  bgImage: { type: String, default:"" },
  totalTips: { type: Number, required: true, default: 0 },
  paidAmount: { type: Number, required: true, default: 0 },
  dueAmount: { type: Number, required: true, default: 0 },
});

const Team = model('Team', TeamSchema);

export default Team;
