import { Types } from "mongoose";

export interface ITeam {
    name:string;
    teamLogo:string;
    league:Types.ObjectId;
    sport:string;
    bgImage:string;
    totalTips:number;
    paidAmount:number;
    dueAmount:number;
}