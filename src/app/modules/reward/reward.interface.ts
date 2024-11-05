import { Types } from "mongoose";

export interface IReward {
    category:Types.ObjectId;
    name:string;
    image:string;
    pointRequired:number;
    description:string;
    
}