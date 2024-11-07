import { Types } from "mongoose";

export interface IReward {
    category:Types.ObjectId;
    name:string;
    reward_image:string;
    pointRequired:number;
    description:string;
    
}