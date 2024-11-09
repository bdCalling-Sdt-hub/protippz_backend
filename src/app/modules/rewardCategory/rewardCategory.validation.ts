import { z } from 'zod';
import { ENUM_DELIVERY_OPTION } from '../../utilities/enum';

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
    deliveryOption: z
      .enum(Object.values(ENUM_DELIVERY_OPTION) as [string, ...string[]])
      .refine((val) => val !== undefined && val !== null, {
        message: 'Delivery option is required.',
      })
      .refine((val) => Object.values(ENUM_DELIVERY_OPTION).includes(val), {
        message: 'Invalid delivery option selected.',
      }),
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

    deliveryOption: z
      .enum(Object.values(ENUM_DELIVERY_OPTION) as [string, ...string[]])
      .refine((val) => val !== undefined && val !== null, {
        message: 'Delivery option is required.',
      })
      .refine((val) => Object.values(ENUM_DELIVERY_OPTION).includes(val), {
        message: 'Invalid delivery option selected.',
      })
      .optional(),
  }),
});

const rewardCategoryValidation = {
  createRewardCategoryValidationSchema,
  updateRewardCategoryValidationSchema,
};

export default rewardCategoryValidation;
