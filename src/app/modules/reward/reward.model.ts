import { Schema, model } from "mongoose";
import { IReward } from "./reward.interface";



const RewardSchema = new Schema<IReward>({
    category: {
        type: Schema.Types.ObjectId,
        ref: "RewardCategory", // reference the category collection
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    reward_image: {
        type: String,
        default:""
    },
    pointRequired: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});

const Reward = model<IReward>("Reward", RewardSchema);

export default Reward;
