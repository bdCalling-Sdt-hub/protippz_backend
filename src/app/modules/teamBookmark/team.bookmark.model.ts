import { model, Schema } from 'mongoose';
import { ITeamBookmark } from './team.bookmark.interface';

const teamBookmarkSchema = new Schema<ITeamBookmark>(
  {
    team: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: 'Team',
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'NormalUser',
    },
  },
  {
    timestamps: true,
  },
);

const TeamBookmark = model('ShopBookmark', teamBookmarkSchema);

export default TeamBookmark;
