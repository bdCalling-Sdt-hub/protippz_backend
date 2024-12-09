import { z } from 'zod';

const createRewardSchema = z.object({
  body: z.object({
    category: z.string({ required_error: 'Category id is required' }),
    name: z.string().nonempty('Name is required'),
    image: z.string().url('Image must be a valid URL').optional(),
    pointRequired: z.string(),
    description: z.string().nonempty('Description is required'),
  }),
});
const updateRewardSchema = z.object({
  body: z.object({
    category: z
      .string({ required_error: 'Category id is required' })
      .optional(),
    name: z.string().nonempty('Name is required'),
    image: z.string().url('Image must be a valid URL').optional(),
    pointRequired: z
      .string()
      // .positive('Points required must be positive')
      .optional(),
    description: z.string().nonempty('Description is required').optional(),
  }),
});

const rewardValidations = {
  createRewardSchema,
  updateRewardSchema,
};

export default rewardValidations;
