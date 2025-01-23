import validateRequest from '../../middlewares/validateRequest';
import userControllers from './user.controller';
import { Router } from 'express';
import userValidations from './user.validation';
import normalUserValidations from '../normalUser/normalUser.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constant';

const router = Router();

router.post(
  '/register-user',
  validateRequest(normalUserValidations.createNormalUserSchema),
  userControllers.registerUser,
);

router.post(
  '/verify-code',
  validateRequest(userValidations.verifyCodeValidationSchema),
  userControllers.verifyCode,
);

router.post(
  '/resend-verify-code',
  validateRequest(userValidations.resendVerifyCodeSchema),
  userControllers.resendVerifyCode,
);

router.get(
  '/get-my-profile',
  auth(USER_ROLE.user, USER_ROLE.player, USER_ROLE.team, USER_ROLE.superAdmin),
  userControllers.getMyProfile,
);

router.patch(
  '/change-status/:id',
  auth(USER_ROLE.superAdmin),
  validateRequest(userValidations.changeUserStatus),
  userControllers.changeUserStatus,
);
router.delete(
  '/delete-account',
  auth(USER_ROLE.user),
  validateRequest(userValidations.deleteUserAccountValidationSchema),
  userControllers.deleteUserAccount,
);

router.post(
  '/add-email-address',
  auth(USER_ROLE.player, USER_ROLE.team),
  validateRequest(userValidations.addEmailAddressValidationSchema),
  userControllers.addEmailAddress,
);

router.post(
  '/verify-add-email',
  auth(USER_ROLE.player, USER_ROLE.team),
  validateRequest(userValidations.verifyCodeValidationSchema),
  userControllers.verifyAddEmail,
);

export const userRoutes = router;
