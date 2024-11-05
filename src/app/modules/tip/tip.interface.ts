import { Types } from "mongoose";

export interface ITip {
    user: Types.ObjectId;
    entityId: Types.ObjectId;
    entityType: 'Team' | 'Player';
    amount: number;
  }
