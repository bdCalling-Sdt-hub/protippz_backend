import express from 'express';

const router = express.Router();

// router.post(
//   '/create-shop-banner',
//   uploadFile(),
//   auth(USER_ROLE.vendor),
//   bannerController.createShopBanner,
// );
// router.get(
//   '/my-shop-banners',
//   auth(USER_ROLE.vendor),
//   bannerController.getMyShopBanner,
// );
// router.delete(
//   '/delete-shop-banner/:id',
//   auth(USER_ROLE.vendor),
//   bannerController.deleteMyShopBanner,
// );
// router.patch(
//   '/update-shop-banner/:id',
//   auth(USER_ROLE.vendor),
//   uploadFile(),
//   bannerController.updateShopBanner,
// );
// // app banner
// router.post(
//   '/create-app-banner',
//   uploadFile(),
//   auth(USER_ROLE.superAdmin),
//   bannerController.createAppBanner,
// );
// router.get(
//   '/get-app-banners',
//   auth(USER_ROLE.superAdmin),
//   bannerController.getAppBanner,
// );
// router.delete(
//   '/delete-app-banner/:id',
//   auth(USER_ROLE.superAdmin),
//   bannerController.deleteAppBanner,
// );
// router.patch(
//   '/update-app-banner/:id',
//   auth(USER_ROLE.superAdmin),
//   uploadFile(),
//   bannerController.updateAppBanner,
// );
export const bannerRoutes = router;
