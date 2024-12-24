import { Types } from 'mongoose';
import { ENUM_RESIDENTIAL_STATUS } from '../../utilities/enum';
export interface IAddress {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: number;
}

export interface ITaxInfo {
  fullname: string;
  taxId: string;
  address: string;
  residentialStatus: (typeof ENUM_RESIDENTIAL_STATUS)[keyof typeof ENUM_RESIDENTIAL_STATUS];
}

export interface IPlayer {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  league: Types.ObjectId;
  team: Types.ObjectId;
  position: string;
  image: string;
  bgImage: string;
  totalTips: number;
  paidAmount: number;
  dueAmount: number;
  address?: IAddress;
  taxInfo?: ITaxInfo;
  stripe_account_id: string;
}
