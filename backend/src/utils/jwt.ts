import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from './env-validator.js';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tokenVersion: number;
}

interface UserForToken {
  id: string;
  email: string;
  role: string;
  token_version: number;
}

export function generateTokens(user: UserForToken) {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    tokenVersion: user.token_version || 0,
  };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: parseInt(env.JWT_ACCESS_EXPIRY || '86400'),
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: parseInt(env.JWT_REFRESH_EXPIRY || '604800'),
  });

  return { accessToken, refreshToken };
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  // Access token (24 hours)
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: parseInt(env.JWT_ACCESS_EXPIRY || '86400') * 1000,
  });

  // Refresh token (7 days)
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: parseInt(env.JWT_REFRESH_EXPIRY || '604800') * 1000,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
}
