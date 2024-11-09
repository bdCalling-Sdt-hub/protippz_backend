import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import TeamBookmarkController from './team.bookmark.controller';

const router = express.Router();

router.post('/create', auth(USER_ROLE.user),TeamBookmarkController.createBookmark);
router.get(
  '/my-bookmark',
  auth(USER_ROLE.user),
  TeamBookmarkController.getMyBookmark,
);
router.delete(
  '/delete/:id',
  auth(USER_ROLE.user),
  TeamBookmarkController.deleteBookmark,
);

export const teamBookmarkRoutes = router;
