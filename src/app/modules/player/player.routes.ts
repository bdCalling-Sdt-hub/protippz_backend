import express, { NextFunction, Request, Response } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import playerValidations from './player.validation';
import PlayerController from './player.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { uploadFile } from '../../helper/fileUploader';
import simpleAuth from '../../middlewares/simpleAuth';
import teamValidations from '../team/team.validation';

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

  validateRequest(playerValidations.createPlayerValidationSchema),
  PlayerController.createPlayer,
);
router.get('/get-all', simpleAuth, PlayerController.getAllPlayers);
router.get('/get-single/:id', PlayerController.getSinglePlayer);
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
  validateRequest(playerValidations.updatePlayerValidationSchema),
  PlayerController.updatePlayer,
);
router.delete(
  '/delete/:id',
  auth(USER_ROLE.superAdmin),
  PlayerController.deletePlayer,
);
router.patch(
  '/send-money/:id',
  auth(USER_ROLE.superAdmin),
  validateRequest(teamValidations.sendMoneyValidationSchema),
  PlayerController.sendMoneyToPlayer,
);
export const playerRoutes = router;
