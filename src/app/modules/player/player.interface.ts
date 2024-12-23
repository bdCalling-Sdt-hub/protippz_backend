import { Types } from 'mongoose';
export interface IAddress {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: number;
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
}
