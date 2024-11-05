import { Schema, model } from 'mongoose';

const LeagueSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String,default:""  },
  sport: { type: String, required: true },
});

const League = model('League', LeagueSchema);

export default League;
