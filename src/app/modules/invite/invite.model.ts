import { Schema, model } from 'mongoose';

const inviteSchema = new Schema(
  {
    inviter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    inviteToken: { type: String, required: true, unique: true },
    status: { type: String, enum: ['Pending', 'Accepted'], default: 'Pending' },
  },
  {
    timestamps: true,
  },
);

const Invite = model('Invite', inviteSchema);

export default Invite;
