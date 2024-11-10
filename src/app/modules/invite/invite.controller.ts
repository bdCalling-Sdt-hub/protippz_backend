import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import InviteService from './invite.service';

const generateInviteLink = catchAsync(async (req, res) => {
  const result = await InviteService.generateInviteLink(req.user.profileId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Invite link generate successfully',
    data: result,
  });
});

const InviteController = {
  generateInviteLink,
};

export default InviteController;
