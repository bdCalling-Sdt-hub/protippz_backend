import z from 'zod';

const linkBankAccountValidationSchema = z.object({
  body: z.object({
    accountNumber: z.string().nonempty('Account number is required'),
    routingNumber: z.string().nonempty('Routing number is required'),
  }),
});

const stripeValidations = {
  linkBankAccountValidationSchema,
};

export default stripeValidations;
