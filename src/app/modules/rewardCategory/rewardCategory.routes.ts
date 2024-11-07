import express, { NextFunction, Request, Response } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import rewardCategoryValidation from './rewardCategory.validation';
import RewardCategoryController from './rewardCategory.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { uploadFile } from '../../helper/fileUploader';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLE.superAdmin),

  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(
    rewardCategoryValidation.createRewardCategoryValidationSchema,
  ),
  RewardCategoryController.createCategory,
);
router.get('/get-all', RewardCategoryController.getAllCategories);
router.get('/get-single/:id', RewardCategoryController.getSingleCategory);
router.patch(
  '/update/:id',
  auth(USER_ROLE.superAdmin),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },

  RewardCategoryController.updateCategory,
);
router.delete(
  '/delete/:id',
  auth(USER_ROLE.superAdmin),
  RewardCategoryController.deleteCategory,
);

export const rewardCategoryRoutes = router;
