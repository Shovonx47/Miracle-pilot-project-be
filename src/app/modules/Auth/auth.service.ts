import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import config from '../../config';
import { TUser } from './auth.interface';
import {
  createToken,
  generateUserId,
  sendEmailForRegistrationId,
  sendEmailForUpdatePassword,
} from './auth.utils';
import { Auth } from './auth.model';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Response } from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { isEmailValid } from './auth.const';

const registerUserIntoDB = async (payload: TUser) => {
  const isAuthEmail = isEmailValid(payload.email);

  if (!isAuthEmail) {
    throw new Error('Invalid email.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if email already exists
    const existingUser = await Auth.findOne({ email: payload.email }).session(
      session,
    );

    if (existingUser) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Email already exists.');
    }

    // Create a new user
    const newUser = await Auth.create(
      [
        {
          ...payload,
          userId: await generateUserId(),
        },
      ],
      { session },
    );

    // Send email for Registration ID
    await sendEmailForRegistrationId(
      newUser[0].email,
      newUser[0].name,
      newUser[0].userId,
    );

    // JWT Payload
    const jwtPayload = {
      id: newUser[0]._id,
      email: newUser[0].email,
      role: newUser[0].role,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string,
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string,
    );

    // Commit the transaction
    await session.commitTransaction();

    return {
      id: newUser[0]._id,
      role: newUser[0].role,
      userId: newUser[0].userId,
      token: accessToken,
      refreshToken,
    };
  } catch (error) {
    // If anything fails, abort the transaction
    await session.abortTransaction();
    throw error;
  } finally {
    // End the session
    session.endSession();
  }
};

const loginUserWithDB = async (payload: TUser) => {
  const { email, password } = payload;

  const existingUser = await Auth.findOne({ email });

  if (!existingUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Account not found.');
  }
  const isDeleted = existingUser?.isDeleted;

  if (isDeleted) {
    throw new AppError(StatusCodes.FORBIDDEN, 'This account is deleted!');
  }

  const isPasswordValid = await existingUser.comparePassword(
    password as string,
  );

  if (!isPasswordValid) {
    throw new Error('Invalid password!');
  }

  const jwtPayload = {
    id: existingUser._id,
    email: existingUser.email,
    role: existingUser.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    role: existingUser.role,
    token: accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = jwt.verify(
    token,
    config.jwt_refresh_secret as string,
  ) as JwtPayload;

  const { email, iat } = decoded;

  // checking if the user is exist
  const existingUser = await Auth.isUserExistsByEmail(email);

  if (!existingUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found.');
  }
  // checking if the user is already deleted
  const isDeleted = existingUser?.isDeleted;

  if (isDeleted) {
    throw new AppError(StatusCodes.FORBIDDEN, 'This user is deleted!');
  }

  // checking if the user is blocked
  const userStatus = existingUser?.status;

  if (userStatus === 'block') {
    throw new AppError(StatusCodes.FORBIDDEN, 'This user is blocked !');
  }

  if (
    existingUser.passwordChangedAt &&
    Auth.isJWTIssuedBeforePasswordChanged(
      existingUser.passwordChangedAt,
      iat as number,
    )
  ) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized !');
  }

  const jwtPayload = {
    email: existingUser.email,
    role: existingUser.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    token: accessToken,
  };
};

const logout = async (res: Response) => {
  // Clear refreshToken cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    // sameSite: "none",
  });

  return { message: 'Logged out successfully' };
};

const sendForgotPasswordCode = async (email: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const isAuthEmail = isEmailValid(email);
    if (!isAuthEmail) {
      throw new Error(
        'Authentication failed. Please enter a valid email address.',
      );
    }

    const existingUser = await Auth.findOne({ email }).session(session);
    if (!existingUser) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    const otp = await sendEmailForUpdatePassword(email, existingUser.name);

    // Set OTP and expiration time (5 minutes from now)
    existingUser.otp = otp;
    existingUser.otpExpireDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    await existingUser.save({ session });

    await session.commitTransaction(); // Commit the transaction if everything is successful
    session.endSession();

    return existingUser;
  } catch (error) {
    await session.abortTransaction(); // Abort the transaction if any error occurs
    session.endSession();
    throw error; // Rethrow the error for further handling
  }
};

const verifyForgotUserAuth = async (payload: {
  email: string;
  otp: string;
}) => {
  const date = new Date();
  const { email, otp } = payload;

  if (!email || !otp) {
    throw new Error('Unauthorized');
  }

  const isAuthEmail = isEmailValid(email);

  if (!isAuthEmail) {
    throw new Error(
      'Authentication failed. Please enter a valid email address.',
    );
  }

  const user = await Auth.findOne({ email });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  if (user.otp !== otp) {
    throw new Error('Incorrect OTP.');
  }
  if (user.otpExpireDate < date) {
    throw new Error('OTP has expired.');
  }

  const result = await Auth.updateOne(
    { email },
    {
      $set: { otp: '', expiredOtpDate: '' },
    },
    { new: true, runValidators: true },
  );
  return result;
};

const updateForgotPasswordFromProfile = async (payload: {
  email: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const { email, newPassword, confirmPassword } = payload;

  const existingUser = await Auth.findOne({ email });

  if (!existingUser) {
    throw new Error('User not found');
  }

  if (!newPassword || !confirmPassword) {
    throw new Error('Please enter password and confirm password');
  }

  if (newPassword !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  const hasPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await Auth.updateOne(
    { _id: existingUser._id },
    {
      password: hasPassword,
      passwordChangedAt: new Date(),
      $unset: { otp: '', otpExpireDate: '' },
    },
    { new: true, runValidators: true },
  );

  return result;
};


const getSingleAuthDetails = async (id: string) => {
  const singleUser = await Auth.findOne({ userId: id });

  if (!singleUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No user found');
  }

  return singleUser;
};



export const UserAuthServices = {
  registerUserIntoDB,
  loginUserWithDB,
  refreshToken,
  logout,
  sendForgotPasswordCode,
  verifyForgotUserAuth,
  updateForgotPasswordFromProfile,
  getSingleAuthDetails
};
