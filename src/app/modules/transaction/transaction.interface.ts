import { Types } from 'mongoose';
import { ENUM_PAYMENT_BY, ENUM_TRANSACTION_STATUS, ENUM_TRANSACTION_TYPE } from '../../utilities/enum';

export interface ITransaction {
  amount: number;
  transactionType: (typeof ENUM_TRANSACTION_TYPE)[keyof typeof ENUM_TRANSACTION_TYPE];
  paymentBy: (typeof ENUM_PAYMENT_BY)[keyof typeof ENUM_PAYMENT_BY];
  status:(typeof ENUM_TRANSACTION_STATUS)[keyof typeof ENUM_TRANSACTION_STATUS];
  transactionId:string;
  description: string;
  entityId: Types.ObjectId;
  entityType: 'User' | 'Team' | 'Player';
}
