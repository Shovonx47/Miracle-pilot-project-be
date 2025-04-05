import { StatusCodes } from 'http-status-codes';
import { TUser } from './auth.interface';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserAuthServices } from './auth.service';
import config from '../../config';
import jwt from 'jsonwebtoken';


const registerUser = catchAsync(async (req, res) => {
  const result = await UserAuthServices.registerUserIntoDB(req.body);

  // The result from registerUserIntoDB already contains the token
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Registration successful.',
    data: result,
  });
});
const loginUser = catchAsync(async (req, res) => {
  const user: Partial<TUser> = req.body;

  const result = await UserAuthServices.loginUserWithDB(user as TUser);

  const { refreshToken, token } = result;

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    // sameSite: "none",
    // path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Login successful!',
    data: token,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await UserAuthServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Token is retrieved successful.',
    data: result,
  });
});

const logout = catchAsync(async (req, res) => {
  await UserAuthServices.logout(res);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Logout successful.',
    data: '',
  });
});

const sendForgotPasswordCode = catchAsync(async (req, res) => {
  const { email } = req.body;

  const result = await UserAuthServices.sendForgotPasswordCode(email);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password reset code has been sent to your email.',
    data: result,
  });
});

const verifyForgotPasswordUser = catchAsync(async (req, res) => {
  await UserAuthServices.verifyForgotUserAuth(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'OTP verification successful.',
    data: '',
  });
});

const updateForgotPassword = catchAsync(async (req, res) => {
  await UserAuthServices.updateForgotPasswordFromProfile(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password update successful!',
    data: '',
  });
});


const getSingleUser = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const result = await UserAuthServices.getSingleAuthDetails(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User retrieved successful!',
    data: result,
  });
});

const getPendingUsers = catchAsync(async (req, res) => {
  const result = await UserAuthServices.getPendingUsersFromDB();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Pending users retrieved successfully!',
    data: result,
  });
});

const approveUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await UserAuthServices.approveUserInDB(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User approved successfully!',
    data: result,
  });
});

const rejectUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await UserAuthServices.rejectUserInDB(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User rejected successfully!',
    data: result,
  });
});

const updateUserApprovalStatus = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;
  const result = await UserAuthServices.updateUserApprovalStatus(userId, status);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `User approval status updated to ${status} successfully!`,
    data: result,
  });
});

export const userAuthController = {
  registerUser,
  loginUser,
  refreshToken,
  logout,
  sendForgotPasswordCode,
  verifyForgotPasswordUser,
  updateForgotPassword,
  getSingleUser,
  getPendingUsers,
  approveUser,
  rejectUser,
  updateUserApprovalStatus
};
