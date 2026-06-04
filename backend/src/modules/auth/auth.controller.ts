import asyncHandler from '../../shared/utils/asyncHandler';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.schema';
import * as authService from './auth.service';
import sendResponse from '../../shared/utils/apiResponse.utils';
import ApiError from '../../shared/errors/ApiError';
import { env } from '../../config/env';
import { CookieOptions } from 'express';

const options: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const registerUser = asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body); // Validate the request body against the Zod schema

  const user = await authService.registerUser(body); // Call the service function to register the user

  if (!user) throw new ApiError(500, 'Failed to create user');

  sendResponse(res, 201, 'user created successfully', {
    id: user.id,
    email: user.email,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);

  const { user, accessToken, refreshToken } = await authService.loginUser(body);

  // send refresh token over secure cookies - by adding these options, front end cant modify these cookies, only backend can do it.
  res.cookie('refreshToken', refreshToken, options);

  sendResponse(res, 200, 'User logged in successfully', {
    accessToken: accessToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
    },
  });
});

const verifyUser = asyncHandler(async (req, res) => {
  const body = verifyEmailSchema.parse(req.body);
  const { user, accessToken, refreshToken } =
    await authService.verifyUser(body);

  // send refresh token over secure cookies - by adding these options, front end cant modify these cookies, only backend can do it.

  res.cookie('refreshToken', refreshToken, options);

  return sendResponse(res, 200, 'user verified', {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
    },
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const body = forgotPasswordSchema.parse(req.body);

  await authService.forgotPassword(body); // send the whole body object

  return sendResponse(res, 200, 'Password Reset request received');
});

const resetPassword = asyncHandler(async (req, res) => {
  const body = resetPasswordSchema.parse(req.body);

  await authService.resetPassword(body);

  return sendResponse(res, 200, 'Password Reset Successfully');
});

const logout = asyncHandler(async (req, res) => {
  const userId = req.userId; // will come from auth middleware
  await authService.logoutUser(userId!);
  res.clearCookie('refreshToken', options);
  sendResponse(res, 200, 'Logged out successfully');
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // get the refresh token from cookie
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body?.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, 'Unauthorized Request');

  const { newAccessToken, newRefreshToken, user } =
    await authService.refreshAccessToken(incomingRefreshToken);

  res.cookie('refreshToken', newRefreshToken, options);
  sendResponse(res, 200, 'new access token and refresh token issued', {
    accessToken: newAccessToken,
    user: {
      id: user.id,
    },
  });
});

export {
  registerUser,
  loginUser,
  verifyUser,
  forgotPassword,
  resetPassword,
  logout,
  refreshAccessToken,
};
