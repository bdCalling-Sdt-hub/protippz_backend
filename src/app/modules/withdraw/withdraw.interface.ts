import { Types } from 'mongoose';
import { ENUM_WITHDRAW_OPTION } from '../../utilities/enum';

export interface IWithdraw {
  amount: number;
  withdrawOption: (typeof ENUM_WITHDRAW_OPTION)[keyof typeof ENUM_WITHDRAW_OPTION];
  status: 'Pending' | 'Completed';
  entityType: 'NormalUser' | 'Team' | 'Player';
  entityId:Types.ObjectId;
  // other fields
  // ACH
  bankAccountNumber:number;
  routingNumber:number;
  accountType:string;
  bankName:string;
  accountHolderName:string;

  // check 
  fullName:string;
  streetAddress:string;
  city:string;
  state:string;
  zipCode:number;
  email:string;
}
