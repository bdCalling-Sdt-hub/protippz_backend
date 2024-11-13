import { model, Schema } from 'mongoose';
import { ENUM_WITHDRAW_OPTION } from '../../utilities/enum';

const WithdrawalRequestSchema = new Schema(
  {
    amount: { type: Number, required: true },
    withdrawOption: {
      type: String,
      enum: Object.values(ENUM_WITHDRAW_OPTION),
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
    },
    entityType: {
      type: String,
      enum: ['NormalUser', 'Player', 'Team'],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'entityType',
    },

    // ACH fields
    bankAccountNumber: { type: Number },
    routingNumber: { type: Number },
    accountType: { type: String },
    bankName: { type: String },
    accountHolderName: { type: String },

    // Check fields
    fullName: { type: String },
    streetAddress: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: Number },
    email: { type: String },
  },
  {
    timestamps: true,
  }
);

export const WithdrawalRequest = model('WithdrawalRequest', WithdrawalRequestSchema);
