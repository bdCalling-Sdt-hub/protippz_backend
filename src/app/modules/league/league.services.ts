/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/appError";
import { ILeague } from "./league.interface";
import League from "./league.model";

const createLeagueIntoDB  = async(payload:ILeague)=>{
    const result = await League.create(payload);
    return result;
}

const getAllLeagueFromDB = async(query:Record<string,any>)=>{
    const leagueQuery = new QueryBuilder(League.find(),query) .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

    const meta = await leagueQuery.countTotal();
    const result = await leagueQuery.modelQuery;

    return {
        meta,
        result
    }
}


const getSingleLeagueFromDB = async(id:string)=>{
    const league = await League.findById(id);
    if(!league){
        throw new AppError(httpStatus.NOT_FOUND,'League not found')
    }

    return league;
}

const updateLeagueIntoDB = async(id:string,payload:Partial<ILeague>)=>{
    const league = await League.findById(id);
    if(!league){
        throw new AppError(httpStatus.NOT_FOUND,'League not found')
    }
    const result = await League.findByIdAndUpdate(id,payload,{new:true,runValidators:true});
    return result;
}

const deleteLeagueFromDB = async (id:string)=>{
    const league = await League.findById(id);
    if(!league){
        throw new AppError(httpStatus.NOT_FOUND,'League not found')
    }

    const result = await League.findByIdAndDelete(id);
    return result;
}



const LeagueServices ={
    createLeagueIntoDB,
    getAllLeagueFromDB,
    getSingleLeagueFromDB,
    updateLeagueIntoDB,
    deleteLeagueFromDB
}

export default LeagueServices;