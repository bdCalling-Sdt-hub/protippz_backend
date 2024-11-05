import { Types } from 'mongoose';

export interface IPlayerBookmark {
  player: Types.ObjectId;
  user: Types.ObjectId;
}
