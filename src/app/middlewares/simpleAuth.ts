import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../error/appError';
import httpStatus from 'http-status';
import { USER_ROLE } from '../modules/user/user.constant';
import NormalUser from '../modules/normalUser/normalUser.model';
import Player from '../modules/player/player.model';
import Team from '../modules/team/team.model';
import SuperAdmin from '../modules/superAdmin/superAdmin.model';
import { NextFunction, Request, Response } from 'express';
const simpleAuth = async (req :Request, res:Response, next:NextFunction) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return next();
    }

    if (token) {

      // Verify token
      let decoded;

      try {
        decoded = jwt.verify(
          token,
          config.jwt_access_secret as string,
        ) as JwtPayload;
      } catch (err) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Token is expired');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, role,} = decoded;

      let profileData;
      if (role === USER_ROLE.user) {
        profileData = await NormalUser.findOne({ user: id }).select('_id');
      } else if (role === USER_ROLE.player) {
        profileData = await Player.findOne({ user: id }).select('_id');
      } else if (role === USER_ROLE.team) {
        profileData = await Team.findOne({ user: id }).select('_id');
      } else if (role === USER_ROLE.superAdmin) {
        profileData = await SuperAdmin.findOne({ user: id }).select('_id');
      }
      decoded.profileId = profileData?._id;
      req.user = decoded as JwtPayload;
    }

    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export default simpleAuth;
