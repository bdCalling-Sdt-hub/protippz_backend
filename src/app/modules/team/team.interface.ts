import { Types } from 'mongoose';
import { IAddress } from '../player/player.interface';

export interface ITeam {
  user: Types.ObjectId;
  name: string;
  team_logo: string;
  league: Types.ObjectId;
  team_bg_image: string;
  sport: string;
  totalTips: number;
  paidAmount: number;
  dueAmount: number;
  address: IAddress;
  stripe_account_id: string;
  stripAccountId: string;
  isStripeConnected: boolean;
  username: string;
  invitedPassword: string;
  email?: string;
}

export interface IInviteTeamPayload {
  username: string;
  password: string;
}
