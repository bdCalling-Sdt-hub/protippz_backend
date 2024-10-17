import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import metaController from './meta.controller';

const router = express.Router();
router.get(
  '/get-admin-meta-data',
  auth(USER_ROLE.superAdmin),
  metaController.getAminDashboardMetaData,
);
router.get(
  '/get-vendor-meta-data',
  auth(USER_ROLE.vendor),
  metaController.getVendorDashboardMetaData,
);
router.get(
  '/get-shop-chart-data',
  auth(USER_ROLE.superAdmin),
  metaController.getShopChartData,
);

export const metaRoutes = router;