import { Types } from 'mongoose';

export interface ITeamBookmark {
  team: Types.ObjectId;
  user: Types.ObjectId;
}
