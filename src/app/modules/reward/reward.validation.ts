import { z } from "zod";
import { Types } from "mongoose";

const createRewardSchema = z.object({
    category: z.instanceof(Types.ObjectId).refine(
        (val) => val instanceof Types.ObjectId,
        { message: "Invalid ObjectId for category" }
    ),
    name: z.string().nonempty("Name is required"),
    image: z.string().url("Image must be a valid URL").optional(),
    pointRequired: z.number().positive("Points required must be positive"),
    description: z.string().nonempty("Description is required"),
});
const updateRewardSchema = z.object({
    category: z.instanceof(Types.ObjectId).refine(
        (val) => val instanceof Types.ObjectId,
        { message: "Invalid ObjectId for category" }
    ),
    name: z.string().nonempty("Name is required"),
    image: z.string().url("Image must be a valid URL").optional(),
    pointRequired: z.number().positive("Points required must be positive"),
    description: z.string().nonempty("Description is required"),
});



const rewardValidations ={
    createRewardSchema,
    updateRewardSchema
}

export default rewardValidations;
