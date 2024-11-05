import { Types } from "mongoose";

 export interface IPlayer {
    name:string;
    league:Types.ObjectId;
    team:Types.ObjectId;
    position:string;
    image:string;
    bgImage:string;
    totalTips:number;
    paidAmount:number;
    dueAmount:number;
}