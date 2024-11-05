import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import rewardCategoryValidation from './rewardCategory.validation';
import RewardCategoryController from './rewardCategory.controller';

const router = express.Router();

router.post(
  '/create',
  validateRequest(
    rewardCategoryValidation.createRewardCategoryValidationSchema,
  ),
  RewardCategoryController.createCategory,
);
router.get('/get-all', RewardCategoryController.getAllCategories);
router.patch('/update/:id', RewardCategoryController.updateCategory);
router.delete('/delete/:id', RewardCategoryController.deleteCategory);

export const categoryRoutes = router;
