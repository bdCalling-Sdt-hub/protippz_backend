import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import depositValidations from './deposit.validation';
import DepositController from './deposit.controller';

const router = express.Router();

router.post(
  '/create-deposit-intent',
  auth(USER_ROLE.user),
  validateRequest(depositValidations.depositValidationSchema),
  DepositController.depositAmount,
);

router.post(
  '/execute-stripe-deposit',
  auth(USER_ROLE.user),
  validateRequest(depositValidations.executeStipeDeposit),
  DepositController.executeDepositWithStripe,
);

router.post(
  '/execute-paypal-deposit',
  auth(USER_ROLE.user),
  validateRequest(depositValidations.executePaypalDeposit),
  DepositController.executePaypalDeposit,
);

export const depositRoutes = router;
