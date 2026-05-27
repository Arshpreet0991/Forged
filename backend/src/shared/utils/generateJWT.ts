import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';

function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: env.JWT_REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export { generateAccessToken, generateRefreshToken };

// Cast to SignOptions['expiresIn'] because jsonwebtoken expects a specific
// StringValue type, not a plain string. This tells TypeScript the env value
// is a valid expiry format like '1h', '7d', '30m'
