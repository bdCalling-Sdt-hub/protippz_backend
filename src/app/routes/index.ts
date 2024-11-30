import { Router } from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';

import { bannerRoutes } from '../modules/banner/banner.routes';
import { ManageRoutes } from '../modules/manage-web/manage.routes';
import { feedbackRoutes } from '../modules/feedback/feedback.routes';
import { playerBookmarkRoutes } from '../modules/playerBookmark/player.bookmark.routes';
import { teamBookmarkRoutes } from '../modules/teamBookmark/team.bookmark.routes';
import { normalUserRoutes } from '../modules/normalUser/normalUser.routes';
import { superAdminRoutes } from '../modules/superAdmin/superAdmin.routes';
import { leagueRoutes } from '../modules/league/league.routes';
import { teamRoutes } from '../modules/team/team.routes';
import { playerRoutes } from '../modules/player/player.routes';
import { rewardCategoryRoutes } from '../modules/rewardCategory/rewardCategory.routes';
import { rewardRoutes } from '../modules/reward/reward.routes';
import { tipRoutes } from '../modules/tip/tip.routes';
import { redeemRequestRoutes } from '../modules/redeemRequest/redeemRequest.routes';
import { metaRoutes } from '../modules/meta/meta.routes';
import { inviteRoutes } from '../modules/invite/invite.routes';
import { depositRoutes } from '../modules/deposit/deposit.routes';
import { transactionRoutes } from '../modules/transaction/transaction.routes';
import { withdrawRoutes } from '../modules/withdraw/withdraw.routes';
import { stripeRoutes } from '../modules/stripe/stripe.routes';
import { notificationRoutes } from '../modules/notification/notification.routes';

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
    path: '/normal-user',
    router: normalUserRoutes,
  },
  {
    path: '/league',
    router: leagueRoutes,
  },
  {
    path: '/team',
    router: teamRoutes,
  },
  {
    path: '/player',
    router: playerRoutes,
  },

  {
    path: '/reward-category',
    router: rewardCategoryRoutes,
  },
  {
    path: '/reward',
    router: rewardRoutes,
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
  {
    path: '/super-admin',
    router: superAdminRoutes,
  },
  {
    path: '/tip',
    router: tipRoutes,
  },
  {
    path: '/redeem-request',
    router: redeemRequestRoutes,
  },
  {
    path: '/meta',
    router: metaRoutes,
  },
  {
    path: '/invite',
    router: inviteRoutes,
  },
  {
    path: '/deposit',
    router: depositRoutes,
  },
  {
    path: '/withdraw',
    router: withdrawRoutes,
  },
  {
    path: '/transaction',
    router: transactionRoutes,
  },
  {
    path: '/stripe',
    router: stripeRoutes,
  },
  {
    path: '/notification',
    router: notificationRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
