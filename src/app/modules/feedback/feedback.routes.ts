import express from 'express';

const router = express.Router();

// router.post(
//   '/create-feedback',
//   auth(USER_ROLE.customer, USER_ROLE.rider, USER_ROLE.vendor),
//   validateRequest(feedbackValidations.createFeedbackValidationSchema),
//   feedbackController.createFeedBack,
// );

// router.get(
//   '/all-feedbacks',
//   auth(USER_ROLE.superAdmin),
//   feedbackController.getAllFeedback,
// );

// router.put(
//   '/reply-feedback/:id',
//   auth(USER_ROLE.superAdmin),
//   validateRequest(feedbackValidations.updateFeedbackValidationSchema),
//   feedbackController.replyFeedback,
// );

// router.delete(
//   '/delete-feedback/:id',
//   auth(USER_ROLE.superAdmin),
//   feedbackController.deleteFeedback,
// );

export const feedbackRoutes = router;
