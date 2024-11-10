import { Types } from 'mongoose';
import { ENUM_PAYMENT_BY, ENUM_TRANSACTION_TYPE } from '../../utilities/enum';

export interface ITransaction {
  amount: number;
  type: (typeof ENUM_TRANSACTION_TYPE)[keyof typeof ENUM_TRANSACTION_TYPE];
  paymentBy: (typeof ENUM_PAYMENT_BY)[keyof typeof ENUM_PAYMENT_BY];
  description: string;
  user: Types.ObjectId;
}
