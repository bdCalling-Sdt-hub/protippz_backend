import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import TransactionController from './transaction.controller';

const router = express.Router();

router.get(
  '/get-all',
  auth(USER_ROLE.superAdmin),
  TransactionController.getAllTransaction,
);
router.get(
  '/my-transactions',
  auth(USER_ROLE.user, USER_ROLE.player, USER_ROLE.team),
  TransactionController.getMyTransaction,
);

export const transactionRoutes = router;
