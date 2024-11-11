import { model, Schema } from 'mongoose';
import { ENUM_WITHDRAW_OPTION } from '../../utilities/enum';

const WithdrawalRequestSchema = new Schema({
  requestId: { type: String, required: true, unique: true },
  requestAmount: { type: Number, required: true },
  withdrawOption: {
    type: String,
    enum: Object.values(ENUM_WITHDRAW_OPTION),
    required: true,
  },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  entityType: {
    type: String,
    enum: ['User', 'Player', 'Team'],
    required: true,
  },
  entityId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'entityType',
  },
  requestDate: { type: Date, default: Date.now },
});

export const WithdrawalRequest = model(
  'WithdrawalRequest',
  WithdrawalRequestSchema,
);
