import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import StripeController from './stripe.controller';
import validateRequest from '../../middlewares/validateRequest';
import stripeValidations from './stripe.validation';

const router = express.Router();

router.post(
  '/link-bank-account',
  auth(USER_ROLE.player, USER_ROLE.team, USER_ROLE.user),
  validateRequest(stripeValidations.linkBankAccountValidationSchema),
  StripeController.linkBankAccount,
);

export const stripeRoutes = router;
