import crypto from 'crypto';
import Invite from './invite.model';
const generateInviteLink = async (inviterId: string) => {
  const inviteToken = crypto.randomBytes(4).toString('hex');

  await Invite.create({ inviter: inviterId, inviteToken });

  return {
    link: `https://yourapp.com/register?invite=${inviteToken}`,
    token:inviteToken
  };
};

const InviteService = {
  generateInviteLink,
};

export default InviteService;
