import { z } from 'zod';

const createRewardCategoryValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(1, 'Name is required'),
    image: z
      .string()
      .url('Image must be a valid URL')
      .min(1, 'Image is required')
      .optional(),
  }),
});
const updateRewardCategoryValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(1, 'Name is required')
      .optional(),
    image: z
      .string()
      .url('Image must be a valid URL')
      .min(1, 'Image is required')
      .optional(),
  }),
});

const rewardCategoryValidation = {
  createRewardCategoryValidationSchema,
  updateRewardCategoryValidationSchema,
};

export default rewardCategoryValidation;
