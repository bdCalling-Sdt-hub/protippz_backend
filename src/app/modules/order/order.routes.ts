import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import orderValidations from './order.validation';
import orderController from './order.controller';

const router = express.Router();

router.post(
  '/create-order',
  auth(USER_ROLE.customer),
  validateRequest(orderValidations.createOrderValidationSchema),
  orderController.createOrder,
);
router.get(
  '/all-orders',
  auth(USER_ROLE.superAdmin),
  orderController.getAllOrders,
);

export const orderRoutes = router;