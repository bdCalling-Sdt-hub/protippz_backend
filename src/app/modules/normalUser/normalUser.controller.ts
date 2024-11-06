import httpStatus from "http-status";
import catchAsync from "../../utilities/catchasync";
import sendResponse from "../../utilities/sendResponse";
import NormalUserServices from "./normalUser.services";

const updateUserProfile = catchAsync(async (req, res) => {
    const result = await NormalUserServices.updateUserProfile(req.user.profileId,req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Profile updated successfully',
      data: result,
    });
  });



const NormalUserController = {
    updateUserProfile
}


export default NormalUserController;