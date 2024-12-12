import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import TipController from './tip.controller';
import validateRequest from '../../middlewares/validateRequest';
import tipValidations from './tip.validation';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLE.user),
  validateRequest(tipValidations.createTipValidationSchema),
  TipController.createTip,
);

router.patch(
  '/execute-stipe-payment',
  auth(USER_ROLE.user),
  validateRequest(tipValidations.makeTipPaymentSuccessValidationSchema),
  TipController.paymentSuccessWithStripe,
);
router.patch(
  '/execute-paypal-payment',
  auth(USER_ROLE.user),
  validateRequest(tipValidations.executePaypalPaymentValidationSchema),
  TipController.executePaypalPayment,
);

router.get(
  '/get-all',
  auth(USER_ROLE.superAdmin), // Assuming only admins can view all tips
  TipController.getAllTips,
);

router.get('/my-tips', auth(USER_ROLE.user), TipController.getUserTips);

router.get(
  '/tip/:id',
  auth(USER_ROLE.user, USER_ROLE.superAdmin),
  TipController.getSingleTip,
);
router.patch(
  '/execute-paypal-payment-app',
  auth(USER_ROLE.user),
  TipController.executeDepositPaymentWithApp,
);

export const tipRoutes = router;
