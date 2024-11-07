import { Types } from "mongoose";

export interface ITeam {
    name:string;
    team_logo:string;
    league:Types.ObjectId;
    team_bg_image:string;
    totalTips:number;
    paidAmount:number;
    dueAmount:number;
}