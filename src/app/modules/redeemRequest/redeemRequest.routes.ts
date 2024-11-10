import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import redeemValidations from './redeemRequest.validation';
import RedeemRequestController from './redeemRequest.controller';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLE.user),
  validateRequest(redeemValidations.redeemRequestSchema),
  RedeemRequestController.createRedeemRequest,
);
router.post(
  '/verify-redeem-email/:id',
  auth(USER_ROLE.user),
  RedeemRequestController.verifyCodeForRedeem,
);

router.get(
  '/get-all',
  auth(USER_ROLE.superAdmin),
  RedeemRequestController.getAllRedeemRequest,
);
router.get(
  '/my-redeem',
  auth(USER_ROLE.user),
  RedeemRequestController.getMyRedeem,
);

router.patch(
  '/change-status/:id',
  auth(USER_ROLE.superAdmin),
  validateRequest(redeemValidations.changeRedeemStatusValidationSchema),
  RedeemRequestController.changeRedeemStatus,
);

export const redeemRequestRoutes = router;
