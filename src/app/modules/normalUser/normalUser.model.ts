import { model, Schema } from 'mongoose';
import { INormalUser } from './normalUser.interface';

const NormalUserSchema = new Schema<INormalUser>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      // required: true,
      // unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      // required: true,
    },
    profile_image: {
      type: String,
      default: '',
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    totalPoint: {
      type: Number,
      required: true,
      default: 0,
    },
    totalTipSent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);
const NormalUser = model<INormalUser>('NormalUser', NormalUserSchema);

export default NormalUser;
