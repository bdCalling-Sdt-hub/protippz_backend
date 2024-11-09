import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import PlayerBookmarkController from './player.bookmark.controller';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLE.user),
  PlayerBookmarkController.createPlayerBookmark,
);

router.get(
  '/my-bookmark',
  auth(USER_ROLE.user),
  PlayerBookmarkController.getMyPlayerBookmark,
);

router.delete(
  '/delete/:id',
  auth(USER_ROLE.user),
  PlayerBookmarkController.deletePlayerBookmark,
);

export const playerBookmarkRoutes = router;
