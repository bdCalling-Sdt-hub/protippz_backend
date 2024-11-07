import httpStatus from "http-status";
import sendResponse from "../../utilities/sendResponse";
import PlayerServices from "./player.services";
import catchAsync from "../../utilities/catchasync";

const createPlayer = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'player_image' in files) {
    req.body.player_image = files['player_image'][0].path;
  }
  if (files && typeof files === 'object' && 'player_bg_image' in files) {
    req.body.player_bg_image = files['player_bg_image'][0].path;
  }
  const result = await PlayerServices.createPlayerIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Player created successfully',
    data: result,
  });
});

const getAllPlayers = catchAsync(async (req, res) => {
  const result = await PlayerServices.getAllPlayersFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Players retrieved successfully',
    data: result,
  });
});

const getSinglePlayer = catchAsync(async (req, res) => {
  const result = await PlayerServices.getSinglePlayerFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Player retrieved successfully',
    data: result,
  });
});

const updatePlayer = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'player_image' in files) {
    req.body.player_image = files['player_image'][0].path;
  }
  if (files && typeof files === 'object' && 'player_bg_image' in files) {
    req.body.player_bg_image = files['player_bg_image'][0].path;
  }
  const result = await PlayerServices.updatePlayerIntoDB(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Player updated successfully',
    data: result,
  });
});

const deletePlayer = catchAsync(async (req, res) => {
  const result = await PlayerServices.deletePlayerFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Player deleted successfully',
    data: result,
  });
});

const PlayerController = {
  createPlayer,
  getAllPlayers,
  getSinglePlayer,
  updatePlayer,
  deletePlayer
};

export default PlayerController;
