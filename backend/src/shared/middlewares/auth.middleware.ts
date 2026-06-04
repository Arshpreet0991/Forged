import ApiError from '../errors/ApiError';
import asyncHandler from '../utils/asyncHandler';
import { env } from '../../config/env';
import jwt from 'jsonwebtoken';
import TokenPayload from '../types/jwtToken.types';

export const checkLogin = asyncHandler(async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) throw new ApiError(401, 'Unauthorized Request');

  try {
    const decodedToken = jwt.verify(
      token,
      env.JWT_ACCESS_TOKEN_SECRET,
    ) as TokenPayload;
    req.userId = decodedToken.userId;
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }

  next();
});

export default checkLogin;
