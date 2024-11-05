import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import TeamBookmarkController from './team.bookmark.controller';

const router = express.Router();

router.post(
  '/create-shop-bookmark',
auth(USER_ROLE.user)

);
router.get(
  '/my-bookmark-teams',
  auth(USER_ROLE.user),
  TeamBookmarkController.getMyBookmark,
);
router.delete(
  '/delete-bookmark-team/:id',
  auth(USER_ROLE.user),
  TeamBookmarkController.deleteBookmark,
);

export const teamBookmarkRoutes = router;
