import { z } from "zod";

const redeemRequestSchema = z.object({
  body:z.object({
    reward:z.string({required_error:"Reward id is required"}),
  category: z.string({required_error:"Category id is required"}),
  email: z.string().email("Invalid email format").optional(),
  userName: z.string().optional(),
  phone: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  })
});

const redeemValidations = {
    redeemRequestSchema
}

export default redeemValidations;
