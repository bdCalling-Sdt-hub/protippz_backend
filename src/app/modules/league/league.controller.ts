import httpStatus from "http-status";
import catchAsync from "../../utilities/catchasync";
import sendResponse from "../../utilities/sendResponse";
import LeagueServices from "./league.services";

const createLeague = catchAsync(async (req, res) => {
    const result = await LeagueServices.createLeagueIntoDB(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'League processed successfully',
      data: result,
    });
  });


const getAllLeague = catchAsync(async(req,res)=>{
    const result = await LeagueServices.getAllLeagueFromDB(req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'League retrieved successfully',
      data: result,
    });
})

const getSingleLeague = catchAsync(async(req,res)=>{
    const result = await LeagueServices.getSingleLeagueFromDB(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'League retrieved successfully',
      data: result,
    });
})
const updateLeague = catchAsync(async(req,res)=>{
    const result = await LeagueServices.updateLeagueIntoDB(req.params.id,req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'League updated successfully',
      data: result,
    });
})
const deleteLeague = catchAsync(async(req,res)=>{
    const result = await LeagueServices.deleteLeagueFromDB(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'League deleted successfully',
      data: result,
    });
})



const LeagueController = {
    createLeague,
    getAllLeague,
    getSingleLeague,
    updateLeague,
    deleteLeague
}

export default LeagueController;








