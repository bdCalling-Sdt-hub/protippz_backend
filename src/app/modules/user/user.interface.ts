/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';
import { USER_ROLE } from './user.constant';

export interface TUser {
  _id: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  passwordChangedAt?: Date;
  role: 'user' | 'team' | 'player' | 'superAdmin';
  status: 'in-progress' | 'blocked';
  verifyCode: number;
  resetCode: number;
  isVerified: boolean;
  isAddEmailVerified: boolean;
  addEmailVerifiedCode: number;
  isResetVerified: boolean;
  codeExpireIn: Date;
  isActive: boolean;
  isDeleted: boolean;
  inviteToken: string;
  stripeCustomerId: string;
  bankAccountId: string;
}
export interface TLoginUser {
  email: string;
  password: string;
}

export interface ILoginWithGoogle {
  name: string;
  email: string;
  profile_image?: string;
  inviteToken?: string;
  username?: string;
  phone?: string;
  address?: string;
}

export interface UserModel extends Model<TUser> {
  // myStaticMethod(): number;
  isUserExists(phoneNumber: string): Promise<TUser>;
  //   isUserDeleted(email: string): Promise<boolean>;
  //   isUserBlocked(email: string): Promise<boolean>;
  isPasswordMatched(
    plainPassword: string,
    hashPassword: string,
  ): Promise<TUser>;
  isJWTIssuedBeforePasswordChange(
    passwordChangeTimeStamp: Date,
    jwtIssuedTimeStamp: number,
  ): Promise<boolean>;
}

export type TUserRole = keyof typeof USER_ROLE;
