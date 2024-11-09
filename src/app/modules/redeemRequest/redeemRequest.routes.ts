import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import redeemValidations from './redeemRequest.validation';
import RedeemRequestController from './redeemRequest.controller';

const router = express.Router();

router.post(
  '/create-redeem-request',
  auth(USER_ROLE.user),
  validateRequest(redeemValidations.redeemRequestSchema),
  RedeemRequestController.createRedeemRequest,
);
router.post(
  '/verify-redeem-email',
  auth(USER_ROLE.user),
  RedeemRequestController.verifyCodeForRedeem,
);

export const redeemRequestRoutes = router;
