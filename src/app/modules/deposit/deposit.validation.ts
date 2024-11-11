import { z } from "zod";
import { ENUM_PAYMENT_BY } from "../../utilities/enum";


const depositValidationSchema = z.object({
    body:z.object({
        amount:z.number({required_error:"Amount is required"}),
        paymentBy:z.enum(Object.values(ENUM_PAYMENT_BY) as [string, ...string[]]),
        description:z.string().optional(),
    })
})



const depositValidations = {
    depositValidationSchema
}

export default depositValidations;