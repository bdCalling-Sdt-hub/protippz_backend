import { z } from 'zod';

const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    team_logo: z.string().url('Team logo must be a valid URL').optional(),
    league: z.string().min(1, 'League ID is required'), // Assuming ObjectId is received as a string
    team_bg_image: z
      .string()
      .url('Background image must be a valid URL')
      .optional(),
    //  sport: z.string().min(1, 'Sport is required'),
    totalTips: z.number().min(0, 'Total tips must be zero or more').optional(),
    paidAmount: z
      .number()
      .min(0, 'Paid amount must be zero or more')
      .optional(),
    dueAmount: z.number().min(0, 'Due amount must be zero or more').optional(),
  }),
});
const updateTeamSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    team_logo: z.string().url('Team logo must be a valid URL').optional(),
    league: z.string().min(1, 'League ID is required').optional(), // Assuming ObjectId is received as a string
    sport: z.string().min(1, 'Sport is required').optional(),
    team_bg_image: z
      .string()
      .url('Background image must be a valid URL')
      .optional(),
    totalTips: z.number().min(0, 'Total tips must be zero or more').optional(),
    paidAmount: z
      .number()
      .min(0, 'Paid amount must be zero or more')
      .optional(),
    dueAmount: z.number().min(0, 'Due amount must be zero or more').optional(),
  }),
});

const sendMoneyValidationSchema = z.object({
  body: z.object({
    amount: z.number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    }),
  }),
});

const inviteValidationSchema = z.object({
  body: z.object({
    username: z.string({ required_error: 'Username is required' }),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, { message: 'Password must be 5 character long' }),
  }),
});

const teamValidations = {
  createTeamSchema,
  updateTeamSchema,
  sendMoneyValidationSchema,
  inviteValidationSchema,
};

export default teamValidations;
