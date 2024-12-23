import { Schema, model } from 'mongoose';
import { ILeague } from './league.interface';

const LeagueSchema = new Schema<ILeague>(
  {
    name: { type: String, required: true, unique: true },
    league_image: { type: String, default: '' },
    sport: { type: String, required: true },
  },
  { timestamps: true },
);

const League = model('League', LeagueSchema);

export default League;
