import express from 'express';

const router = express.Router();
// router.get(
//   '/get-admin-meta-data',
//   auth(USER_ROLE.superAdmin),
//   metaController.getAminDashboardMetaData,
// );
// router.get(
//   '/get-vendor-meta-data',
//   auth(USER_ROLE.vendor),
//   metaController.getVendorDashboardMetaData,
// );
// router.get(
//   '/get-shop-chart-data',
//   auth(USER_ROLE.superAdmin),
//   metaController.getShopChartData,
// );
// router.get(
//   '/get-income-chart-data',
//   auth(USER_ROLE.superAdmin),
//   metaController.getAreaChartDataForIncome,
// );
// router.get(
//   '/get-sales-chart-data',
//   auth(USER_ROLE.vendor),
//   metaController.getAreaChartDataForSales,
// );

export const metaRoutes = router;
