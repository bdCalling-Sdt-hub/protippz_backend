import express, { NextFunction, Request, Response } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import rewardValidations from './reward.validation';
import RewardController from './reward.controller';
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

  validateRequest(rewardValidations.createRewardSchema),
  RewardController.createReward,
);
router.get('/get-all', RewardController.getAllRewards);
router.get('/get-single/:id', RewardController.getSingleReward);
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
  validateRequest(rewardValidations.updateRewardSchema),
  RewardController.updateReward,
);
router.delete('/delete/:id',auth(USER_ROLE.superAdmin), RewardController.deleteReward);

export const rewardRoutes = router;
