import { z } from 'zod';

const createPlayerValidationSchema = z.object({
 body:z.object({
    name: z.string().min(1, "Name is required"),
    league: z.string().min(1, "League ID is required"),  // Assuming ObjectId is received as a string
    team: z.string().min(1, "Team ID is required"),      // Assuming ObjectId is received as a string
    position: z.string().min(1, "Position is required"),
    image: z.string().url("Image must be a valid URL").optional(),
    bgImage: z.string().url("Background image must be a valid URL").optional(),
    totalTips: z.number().min(0, "Total tips must be zero or more"),
    paidAmount: z.number().min(0, "Paid amount must be zero or more"),
    dueAmount: z.number().min(0, "Due amount must be zero or more"),
 })
});
const updatePlayerValidationSchema = z.object({
 body:z.object({
    name: z.string().min(1, "Name is required").optional(),
    league: z.string().min(1, "League ID is required").optional(),  // Assuming ObjectId is received as a string
    team: z.string().min(1, "Team ID is required").optional(),      // Assuming ObjectId is received as a string
    position: z.string().min(1, "Position is required").optional(),
    image: z.string().url("Image must be a valid URL").optional(),
    bgImage: z.string().url("Background image must be a valid URL").optional(),
    totalTips: z.number().min(0, "Total tips must be zero or more").optional(),
    paidAmount: z.number().min(0, "Paid amount must be zero or more").optional(),
    dueAmount: z.number().min(0, "Due amount must be zero or more").optional(),
 })
});

const playerValidations ={
    createPlayerValidationSchema,
    updatePlayerValidationSchema

}

export default playerValidations;
