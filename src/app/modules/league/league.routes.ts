import express, { NextFunction, Request, Response } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import leagueValidations from './league.validation';
import LeagueController from './league.controller';
import { uploadFile } from '../../helper/fileUploader';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

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
  validateRequest(leagueValidations.createLeagueSchema),
  LeagueController.createLeague,
);
router.get('/get-all', LeagueController.getAllLeague);
router.get('/get-single/:id', LeagueController.getSingleLeague);
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
  validateRequest(leagueValidations.updateLeagueSchema),
  LeagueController.updateLeague
);
router.delete('/delete/:id',  auth(USER_ROLE.superAdmin), LeagueController.deleteLeague);

export const leagueRoutes = router;
