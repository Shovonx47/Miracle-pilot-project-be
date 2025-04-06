import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';

import catchAsync from '../utils/catchAsync';
import { StatusCodes } from 'http-status-codes';
import { TUserRole } from '../modules/Auth/auth.interface';
import { Auth } from '../modules/Auth/auth.model';

const authorization = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    // If no roles are required and token is missing, we can proceed
    if (requiredRoles.length === 0 && !authHeader) {
      next();
      return;
    }

    // checking if the token is missing
    if (!authHeader) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Authorization header is missing');
    }
    
    // Extract token from Bearer format if present
    let token = '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid token format. Use Bearer token');
    }

    if (!token) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Token is missing');
    }
      
    // checking if the given token is valid
    let decoded;

    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;
    } catch (error) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
    }

    const { role, email, iat } = decoded;

    // checking if the user is exist
    // const user = await Auth.findOne({ email });
    const user = await Auth.isUserExistsByEmail(email);

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found !');
    }
    const isDeleted = user?.isDeleted;

    if (isDeleted) {
      throw new AppError(StatusCodes.FORBIDDEN, 'This user is deleted !');
    }

    // checking if the user is blocked
    const userStatus = user?.status;

    if (userStatus === 'block') {
      throw new AppError(StatusCodes.FORBIDDEN, 'This user is blocked ! !');
    }

    if (
      user.passwordChangedAt &&
      Auth.isJWTIssuedBeforePasswordChanged(
        user.passwordChangedAt,
        iat as number,
      )
    ) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized !');
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

export default authorization;
