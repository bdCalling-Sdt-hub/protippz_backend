import express from 'express';

const router = express.Router();

// router.get(
//   '/get-all-notification',
//   auth(
//     USER_ROLE.superAdmin,
//     USER_ROLE.customer,
//     USER_ROLE.rider,
//     USER_ROLE.vendor,
//   ),
//   notificationController.getAllNotification,
// );
// router.patch(
//   '/see-notification',
//   auth(
//     USER_ROLE.superAdmin,
//     USER_ROLE.customer,
//     USER_ROLE.rider,
//     USER_ROLE.vendor,
//   ),
//   notificationController.seeNotification,
// );

export const notificationRoutes = router;
