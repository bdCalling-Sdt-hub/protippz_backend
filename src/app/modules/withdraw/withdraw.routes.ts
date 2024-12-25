import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import WithdrawRequestController from './withdraw.controller';
import validateRequest from '../../middlewares/validateRequest';
import withdrawRequestValidations from './withdraw.validation';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLE.user, USER_ROLE.player, USER_ROLE.team),
  validateRequest(withdrawRequestValidations.withdrawalRequestSchema),
  WithdrawRequestController.createWithdrawRequest,
);

router.get(
  '/get-all',
  auth(USER_ROLE.superAdmin),
  WithdrawRequestController.getAllWithdrawRequest,
);
router.patch(
  '/update-status/:id',
  auth(USER_ROLE.superAdmin),
  validateRequest(withdrawRequestValidations.withdrawRequestValidationSchema),
  WithdrawRequestController.updateWithdrawRequestStatus,
);
router.post(
  '/ach-withdraw',
  auth(USER_ROLE.player, USER_ROLE.team),
  WithdrawRequestController.achWithdraw,
);

export const withdrawRoutes = router;
