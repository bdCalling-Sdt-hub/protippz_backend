import express, { NextFunction, Request, Response } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import teamValidations from './team.validation';
import TeamController from './team.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { uploadFile } from '../../helper/fileUploader';
import simpleAuth from '../../middlewares/simpleAuth';

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
  validateRequest(teamValidations.createTeamSchema),
  TeamController.createTeam,
);
router.get('/get-all', simpleAuth, TeamController.getAllTeams);
router.get('/get-single/:id', TeamController.getSingleTeam);
router.patch(
  '/update/:id',

  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(teamValidations.updateTeamSchema),
  TeamController.updateTeam,
);
router.delete('/delete/:id', TeamController.deleteTeam);
router.patch(
  '/send-money/:id',
  auth(USER_ROLE.superAdmin),
  validateRequest(teamValidations.sendMoneyValidationSchema),
  TeamController.sendMoneyToTeam,
);
router.post(
  '/invite-team/:id',
  auth(USER_ROLE.superAdmin),
  validateRequest(teamValidations.inviteValidationSchema),
  TeamController.inviteTeam,
);

router.patch(
  '/edit-address-tax',
  auth(USER_ROLE.team),
  TeamController.editTeamAddressTax,
);
export const teamRoutes = router;
