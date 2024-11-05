import { z } from 'zod';

const createTeamSchema = z.object({
 body:z.object({
    name: z.string().min(1, "Name is required"),
    teamLogo: z.string().url("Team logo must be a valid URL").optional(),
    league: z.string().min(1, "League ID is required"),  // Assuming ObjectId is received as a string
    sport: z.string().min(1, "Sport is required"),
    bgImage: z.string().url("Background image must be a valid URL").optional(),
    totalTips: z.number().min(0, "Total tips must be zero or more"),
    paidAmount: z.number().min(0, "Paid amount must be zero or more"),
    dueAmount: z.number().min(0, "Due amount must be zero or more"),
 })
});
const updateTeamSchema = z.object({
 body:z.object({
    name: z.string().min(1, "Name is required").optional(),
    teamLogo: z.string().url("Team logo must be a valid URL").optional(),
    league: z.string().min(1, "League ID is required").optional(),  // Assuming ObjectId is received as a string
    sport: z.string().min(1, "Sport is required").optional(),
    bgImage: z.string().url("Background image must be a valid URL").optional(),
    totalTips: z.number().min(0, "Total tips must be zero or more").optional(),
    paidAmount: z.number().min(0, "Paid amount must be zero or more").optional(),
    dueAmount: z.number().min(0, "Due amount must be zero or more").optional(),
 })
});

const teamValidations ={
    createTeamSchema,
    updateTeamSchema
}

export default teamValidations;