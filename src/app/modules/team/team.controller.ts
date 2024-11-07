import httpStatus from "http-status";
import sendResponse from "../../utilities/sendResponse";
import TeamServices from "./team.services";
import catchAsync from "../../utilities/catchasync";

const createTeam = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'team_logo' in files) {
    req.body.team_logo = files['team_logo'][0].path;
  }
  if (files && typeof files === 'object' && 'team_bg_image' in files) {
    req.body.team_bg_image = files['team_bg_image'][0].path;
  }
  const result = await TeamServices.createTeamIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Team created successfully',
    data: result,
  });
});

const getAllTeams = catchAsync(async (req, res) => {
  const result = await TeamServices.getAllTeamsFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Teams retrieved successfully',
    data: result,
  });
});

const getSingleTeam = catchAsync(async (req, res) => {
  const result = await TeamServices.getSingleTeamFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Team retrieved successfully',
    data: result,
  });
});

const updateTeam = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'team_logo' in files) {
    req.body.team_logo = files['team_logo'][0].path;
  }
  if (files && typeof files === 'object' && 'team_bg_image' in files) {
    req.body.team_bg_image = files['team_bg_image'][0].path;
  }
  const result = await TeamServices.updateTeamIntoDB(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Team updated successfully',
    data: result,
  });
});

const deleteTeam = catchAsync(async (req, res) => {
  const result = await TeamServices.deleteTeamFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Team deleted successfully',
    data: result,
  });
});

const TeamController = {
  createTeam,
  getAllTeams,
  getSingleTeam,
  updateTeam,
  deleteTeam
};

export default TeamController;
