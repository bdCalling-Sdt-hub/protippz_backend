import { Types } from "mongoose";

 export interface IPlayer {
    _id:Types.ObjectId;
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