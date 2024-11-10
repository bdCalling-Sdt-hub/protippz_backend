import { Types } from 'mongoose';
import { ENUM_INVITE_STATUS } from '../../utilities/enum';

interface IInvite {
  inviter: Types.ObjectId;
  inviteToken: string;
  status: (typeof ENUM_INVITE_STATUS)[keyof typeof ENUM_INVITE_STATUS];
}

export default IInvite;
