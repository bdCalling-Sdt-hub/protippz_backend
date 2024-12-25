import { z } from 'zod';
import { ENUM_PAYMENT_BY } from '../../utilities/enum';

const depositValidationSchema = z.object({
  body: z.object({
    amount: z.number({ required_error: 'Amount is required' }),
    paymentBy: z.enum(Object.values(ENUM_PAYMENT_BY) as [string, ...string[]]),
    description: z.string().optional(),
  }),
});

const executeStipeDeposit = z.object({
  body: z.object({
    transactionId: z.string({ required_error: 'Transaction id is required' }),
  }),
});
const executePaypalDeposit = z.object({
  body: z.object({
    paymentId: z.string({ required_error: 'Payment  id is required' }),
    payerId: z.string({ required_error: 'Payer  id is required' }),
  }),
});

const depositValidations = {
  depositValidationSchema,
  executeStipeDeposit,
  executePaypalDeposit,
};

export default depositValidations;
