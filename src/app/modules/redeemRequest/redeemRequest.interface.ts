import { Types } from "mongoose";

export interface IRedeemRequest {
    reward:Types.ObjectId;
    category:Types.ObjectId;
    user:Types.ObjectId;
    email:string;
    userName:string;
    phone:string;
    streetAddress:string;
    city:string;
    state:string;
    zipCode:string;
}