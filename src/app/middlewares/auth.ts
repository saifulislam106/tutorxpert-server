// auth.ts
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { TUserRole } from '../modules/user/user.interface';

import { User } from '../modules/user/user.model';
import { catchAsync } from '../utills/catchAsync';
import config from '../config';
import AppError from '../errors/AppError';
import { StatusCodes } from 'http-status-codes';

export const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // const token = req.headers.authorization;
    const token = req.headers.authorization;
    if (!token) {
      throw new AppError(StatusCodes.UNAUTHORIZED ,'You are not authorized');
    }

    // checking if the given token is valid
    const decoded = jwt.verify(
      token,
      config.jwt_access_token as string,
    ) as JwtPayload;

    const { role, email } = decoded;
    // checking if the user is exist
    const user = await User.isUserExistsByCustomId(email);

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND ,'This user is not found !');
    }
    // checking if the user is already deleted

    const isDeleted = user?.isDeleted;

    if (isDeleted) {
      throw new AppError(StatusCodes.NOT_FOUND ,'This user is deleted !');
    }

    // checking if the user is blocked
    const userStatus = user?.isBlocked;

    if (userStatus) {
      throw new AppError(StatusCodes.BAD_REQUEST ,'This user is blocked ! !');
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(StatusCodes.UNAUTHORIZED ,'You are not authorized  hi hi!');
    }
    req.user = user;
    next();
  });
};
