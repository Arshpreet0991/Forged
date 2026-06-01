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

  sendResponse(res, 200, 'User logged in successfully', {
    accessToken: accessToken,
    refreshToken: refreshToken,
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

  return sendResponse(res, 200, 'user verified', {
    accessToken,
    refreshToken,
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

export { registerUser, loginUser, verifyUser, forgotPassword, resetPassword };
