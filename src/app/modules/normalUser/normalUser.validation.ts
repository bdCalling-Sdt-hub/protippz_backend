import { z } from "zod";

export const createNormalUserSchema = z.object({
  body:z.object({
    name: z.string().nonempty("Name is required"),
    username: z.string().nonempty("Username is required"),
    phone: z
        .string()
        .nonempty("Phone number is required")
        .regex(/^\+?[1-9]\d{1,14}$/, "Phone number must be a valid format"),
    email: z.string().email("Invalid email format"),
    address: z.string().nonempty("Address is required"),
    totalAmount: z.number().nonnegative("Total amount must be zero or positive"),
    totalPoint: z.number().nonnegative("Total points must be zero or positive"),
  })
});

const normalUserValidations = {
    createNormalUserSchema
}

export default normalUserValidations;
