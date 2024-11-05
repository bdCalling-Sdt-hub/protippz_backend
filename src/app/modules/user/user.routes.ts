import validateRequest from '../../middlewares/validateRequest';
import userControllers from './user.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constant';
import { Router } from 'express';
import userValidations from './user.validation';

const router = Router();

router.post(
  '/verify-code',
  validateRequest(userValidations.verifyCodeValidationSchema),
  userControllers.verifyCode,
);

router.post(
  '/resend-verify-code',
  auth(
    USER_ROLE.user,
    USER_ROLE.team,
    USER_ROLE.player,
    USER_ROLE.superAdmin,
  ),
  validateRequest(userValidations.resendVerifyCodeSchema),
  userControllers.resendVerifyCode,
);

export const userRoutes = router;
