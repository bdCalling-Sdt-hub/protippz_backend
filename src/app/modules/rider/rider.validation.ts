import { z } from 'zod';

const registerRiderValidationSchema = z.object({
  body: z.object({
    password: z.string({ required_error: 'Password is required' }),
    rider: z.object({
      name: z.string().min(1, 'Name is required'),
      email: z
        .string()
        .email('Invalid email format')
        .min(1, 'Email is required'),
      phoneNumber: z
        .string({ required_error: 'Phone number is required' })
        .min(1, 'Phone number is required'),
      drivingLicence: z
        .string()
        .min(1, 'Driving licence is required')
        .optional(),
      bankAccountName: z.string().min(1, 'Bank account name is required'),
      bankAccountNumber: z.string().min(1, 'Bank account number is required'),
      bankName: z.string().min(1, 'Bank name is required'),
      paymentMethodPreference: z
        .string()
        .min(1, 'Payment method preference is required'),
    }),
  }),
});

const riderValidations = {
  registerRiderValidationSchema,
};

export default riderValidations;