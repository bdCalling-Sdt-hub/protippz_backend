import express from 'express';
import { USER_ROLE } from '../user/user.constant';
import metaController from './meta.controller';
import auth from '../../middlewares/auth';

const router = express.Router();
router.get(
  '/get-admin-meta-data',
  auth(USER_ROLE.superAdmin),
  metaController.getAminDashboardMetaData,
);

router.get("/tip-chart-data",auth(USER_ROLE.superAdmin),metaController.getTipChartData)
router.get("/user-chart-data",auth(USER_ROLE.superAdmin),metaController.getUserChartData)


export const metaRoutes = router;
