import { Router } from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';

import { categoryRoutes } from '../modules/rewardCategory/rewardCategory.routes';
import { bannerRoutes } from '../modules/banner/banner.routes';
import { ManageRoutes } from '../modules/manage-web/manage.routes';
import { feedbackRoutes } from '../modules/feedback/feedback.routes';
import { playerBookmarkRoutes } from '../modules/playerBookmark/player.bookmark.routes';
import { teamBookmarkRoutes } from '../modules/teamBookmark/team.bookmark.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    router: authRoutes,
  },
  {
    path: '/user',
    router: userRoutes,
  },

  {
    path: '/category',
    router: categoryRoutes,
  },
  {
    path: '/banner',
    router: bannerRoutes,
  },
  {
    path: '/manage',
    router: ManageRoutes,
  },
  {
    path: '/feedback',
    router: feedbackRoutes,
  },
  {
    path: '/player-bookmark',
    router: playerBookmarkRoutes,
  },
  {
    path: '/team-bookmark',
    router: teamBookmarkRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
