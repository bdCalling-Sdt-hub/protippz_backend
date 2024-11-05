import httpStatus from "http-status";
import sendResponse from "../../utilities/sendResponse";
import TeamServices from "./team.services";
import catchAsync from "../../utilities/catchasync";

const createTeam = catchAsync(async (req, res) => {
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
