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

export const depositRoutes = router;
