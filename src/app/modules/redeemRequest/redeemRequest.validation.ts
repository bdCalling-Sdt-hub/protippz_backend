import { z } from 'zod';
import { ENUM_REDEEM_STATUS } from '../../utilities/enum';

const redeemRequestSchema = z.object({
  body: z.object({
    reward: z.string({ required_error: 'Reward id is required' }),
    category: z.string({ required_error: 'Category id is required' }),
    email: z.string().email('Invalid email format').optional(),
    userName: z.string().optional(),
    phone: z.string().optional(),
    streetAddress: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }),
});

const changeRedeemStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(ENUM_REDEEM_STATUS) as [string, ...string[]]),
  }),
});

const redeemValidations = {
  redeemRequestSchema,
  changeRedeemStatusValidationSchema,
};

export default redeemValidations;
