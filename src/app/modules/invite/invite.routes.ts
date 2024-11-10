import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import InviteController from './invite.controller';

const router = express.Router();;

router.post("/invite-friend",auth(USER_ROLE.user),InviteController.generateInviteLink);


export const inviteRoutes = router;