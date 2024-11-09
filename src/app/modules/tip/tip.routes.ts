import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import TipController from './tip.controller';
import validateRequest from '../../middlewares/validateRequest';
import tipValidations from './tip.validation';

const router = express.Router();

router.post(
  '/create-tip',
  auth(USER_ROLE.user),
  validateRequest(tipValidations.createTipValidationSchema),
  TipController.createTip,
);

router.patch(
  '/make-tip-payment-success',
  auth(USER_ROLE.user),
  validateRequest(tipValidations.makeTipPaymentSuccessValidationSchema),
  TipController.makePaymentSuccessForTip,
);

router.get(
  '/all-tips',
  auth(USER_ROLE.superAdmin), // Assuming only admins can view all tips
  TipController.getAllTips,
);

router.get('/my-tips', auth(USER_ROLE.user), TipController.getUserTips);

router.get(
  '/tip/:id',
  auth(USER_ROLE.user, USER_ROLE.superAdmin),
  TipController.getSingleTip,
);

export const tipRoutes = router;
