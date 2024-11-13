import mongoose, { Schema } from 'mongoose';
import {
  ENUM_PAYMENT_BY,
  ENUM_TRANSACTION_STATUS,
  ENUM_TRANSACTION_TYPE,
} from '../../utilities/enum';
import { ITransaction } from './transaction.interface';

const transactionSchema = new Schema<ITransaction>(
  {
    amount: { type: Number, required: true },
    transactionType: {
      type: String,
      enum: Object.values(ENUM_TRANSACTION_TYPE),
      required: true,
    },
    paymentBy: {
      type: String,
      enum: Object.values(ENUM_PAYMENT_BY),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ENUM_TRANSACTION_STATUS),
      default: ENUM_TRANSACTION_STATUS.PENDING,
    },
    description: { type: String, default: '' },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'entityType',
    },
    entityType: {
      type: String,
      enum: ['NormalUser', 'Player', 'Team'],
      required: true,
    },
    transactionId: { type: String, required: true },
  },
  { timestamps: true },
);

const Transaction = mongoose.model<ITransaction>(
  'Transaction',
  transactionSchema,
);

export default Transaction;
