import { z } from 'zod';
import { ENUM_WITHDRAW_OPTION } from '../../utilities/enum';

const WithdrawOptionEnum = z.enum(
  Object.values(ENUM_WITHDRAW_OPTION) as [string, ...string[]],
);

export const withdrawalRequestSchema = z.object({
  body: z
    .object({
      amount: z.number().min(0),
      withdrawOption: WithdrawOptionEnum,
      status: z.enum(['Pending', 'Completed']).default('Pending'),

      // ACH fields
      bankAccountNumber: z.number().optional(),
      routingNumber: z.number().optional(),
      accountType: z.string().optional(),
      bankName: z.string().optional(),
      accountHolderName: z.string().optional(),

      // Check fields
      fullName: z.string().optional(),
      streetAddress: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.number().optional(),
      email: z.string().email().optional(),
    })
    .refine(
      (data) => {
        if (data.withdrawOption === 'ACH') {
          return (
            data.bankAccountNumber !== undefined &&
            data.routingNumber !== undefined &&
            data.accountType !== undefined &&
            data.bankName !== undefined &&
            data.accountHolderName !== undefined
          );
        }
        if (data.withdrawOption === 'Check') {
          return (
            data.fullName !== undefined &&
            data.streetAddress !== undefined &&
            data.city !== undefined &&
            data.state !== undefined &&
            data.zipCode !== undefined &&
            data.email !== undefined
          );
        }
        return true;
      },
      {
        message: 'Required fields are missing based on the withdraw option',
        path: ['withdrawOption'], // This specifies where the error message will appear
      },
    ),
});

const withdrawRequestValidationSchema = z.object({
  body: z.object({
    status: z.enum(['Pending', 'Completed']),
  }),
});

// Type inference for TypeScript
export type IWithdraw = z.infer<typeof withdrawalRequestSchema>;

const withdrawRequestValidations = {
  withdrawalRequestSchema,
  withdrawRequestValidationSchema
};

export default withdrawRequestValidations;
