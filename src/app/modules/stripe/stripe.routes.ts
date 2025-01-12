import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import StripeController from './stripe.controller';
import validateRequest from '../../middlewares/validateRequest';
import stripeValidations from './stripe.validation';

const router = express.Router();

router.post(
  '/create-link-token',
  auth(USER_ROLE.player, USER_ROLE.team),
  StripeController.createLinkToken,
);
router.post(
  '/exchange-public-token',
  auth(USER_ROLE.player, USER_ROLE.team),
  StripeController.exchangePublicToken,
);

router.post(
  '/create-connected-account',
  auth(USER_ROLE.player, USER_ROLE.team),
  StripeController.createConnectedAccount,
);

router.post(
  '/link-bank-account',
  auth(USER_ROLE.player, USER_ROLE.team, USER_ROLE.user),
  validateRequest(stripeValidations.linkBankAccountValidationSchema),
  StripeController.linkBankAccount,
);

router.post(
  '/connect-stripe',
  auth(USER_ROLE.player, USER_ROLE.team),
  StripeController.createOnboardingLink,
);

router.post(
  '/update-connected-accout',
  auth(USER_ROLE.player, USER_ROLE.team),
  StripeController.updateOnboardingLink,
);

export const stripeRoutes = router;
