import { Types } from "mongoose";
import { ENUM_PAYMENT_STATUS, ENUM_TIP_BY } from "../../utilities/enum";

export interface ITip {
    user: Types.ObjectId;
    entityId: Types.ObjectId;
    entityType: 'Team' | 'Player';
    point:number;
    amount: number;
    paymentStatus: typeof ENUM_PAYMENT_STATUS[keyof typeof ENUM_PAYMENT_STATUS];
    tipBy: typeof ENUM_TIP_BY[keyof typeof ENUM_TIP_BY];
    transactionId:string;
  }
