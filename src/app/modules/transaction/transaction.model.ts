import mongoose, { Schema } from 'mongoose';
import { ENUM_PAYMENT_BY, ENUM_TRANSACTION_TYPE } from '../../utilities/enum';
import { ITransaction } from './transaction.interface';

const transactionSchema = new Schema<ITransaction>(
  {
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: Object.values(ENUM_TRANSACTION_TYPE),
      required: true,
    },
    paymentBy: {
      type: String,
      enum: Object.values(ENUM_PAYMENT_BY),
      required: true,
    },
    description: { type: String, default:""  },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

const Transaction = mongoose.model<ITransaction>(
  'Transaction',
  transactionSchema,
);

export default Transaction;
