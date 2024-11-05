import { model, Schema } from 'mongoose';
import { IPlayerBookmark } from './player.bookmark.interface';

const PlayerBookmarkSchema = new Schema<IPlayerBookmark>(
  {
    player: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: 'Player',
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

const PlayerBookmark = model('PlayerBookmark', PlayerBookmarkSchema);

export default PlayerBookmark;
