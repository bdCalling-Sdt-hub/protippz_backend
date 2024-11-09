import { z } from "zod";
import { Types } from "mongoose";
import { ENUM_PAYMENT_STATUS, ENUM_TIP_BY } from "../../utilities/enum";

const createTipValidationSchema = z.object({
  user: z.instanceof(Types.ObjectId),
  entityId: z.instanceof(Types.ObjectId),
  entityType: z.enum(["Team", "Player"]),
  amount: z.number().min(0),
  paymentStatus: z.enum(Object.values(ENUM_PAYMENT_STATUS) as [string, ...string[]]),
  tipBy: z.enum(Object.values(ENUM_TIP_BY) as [string, ...string[]]),
  transactionId: z.string().optional(),
});

const makeTipPaymentSuccessValidationSchema  = z.object({
    body:z.object({
        transactionId:z.string({required_error:"Transaction id is required"})
    })
})


const tipValidations = {
    createTipValidationSchema,
    makeTipPaymentSuccessValidationSchema
}

export default tipValidations;