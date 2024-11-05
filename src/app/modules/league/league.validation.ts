import { z } from 'zod';

const createLeagueSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    image: z.string().url('Image must be a valid URL').optional(),
    sport: z.string().min(1, 'Sport is required'),
  }),
});
const updateLeagueSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    image: z.string().url('Image must be a valid URL').optional(),
    sport: z.string().min(1, 'Sport is required').optional(),
  }),
});

const leagueValidations = {
  createLeagueSchema,
  updateLeagueSchema
};

export default leagueValidations;
