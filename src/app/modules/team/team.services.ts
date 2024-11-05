/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/appError";
import { ITeam } from "./team.interface";
import Team from "./team.model";

const createTeamIntoDB = async (payload: ITeam) => {
  const result = await Team.create(payload);
  return result;
};

const getAllTeamsFromDB = async (query: Record<string, any>) => {
  const teamQuery = new QueryBuilder(Team.find(), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await teamQuery.countTotal();
  const result = await teamQuery.modelQuery;

  return {
    meta,
    result
  };
};

const getSingleTeamFromDB = async (id: string) => {
  const team = await Team.findById(id);
  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
  }
  return team;
};

const updateTeamIntoDB = async (id: string, payload: Partial<ITeam>) => {
  const team = await Team.findById(id);
  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
  }
  const result = await Team.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  return result;
};

const deleteTeamFromDB = async (id: string) => {
  const team = await Team.findById(id);
  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, 'Team not found');
  }
  const result = await Team.findByIdAndDelete(id);
  return result;
};

const TeamServices = {
  createTeamIntoDB,
  getAllTeamsFromDB,
  getSingleTeamFromDB,
  updateTeamIntoDB,
  deleteTeamFromDB
};

export default TeamServices;
