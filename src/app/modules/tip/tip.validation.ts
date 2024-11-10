import { z } from 'zod';
import { ENUM_TIP_BY } from '../../utilities/enum';

const createTipValidationSchema = z.object({
  body: z.object({
    entityId: z.string({ required_error: 'Entity id is required' }),
    entityType: z.enum(['Team', 'Player']),
    amount: z.number().min(0),
    tipBy: z.enum(Object.values(ENUM_TIP_BY) as [string, ...string[]]),
    transactionId: z.string().optional(),
  }),
});

const makeTipPaymentSuccessValidationSchema = z.object({
  body: z.object({
    transactionId: z.string({ required_error: 'Transaction id is required' }),
  }),
});

const executePaypalPaymentValidationSchema = z.object({
  body: z.object({
    paymentId: z.string({ required_error: 'Payment id is required' }),
    payerId: z.string({ required_error: 'Payer id is required' }),
  }),
});

const tipValidations = {
  createTipValidationSchema,
  makeTipPaymentSuccessValidationSchema,
  executePaypalPaymentValidationSchema,
};

export default tipValidations;
