import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { UserRole } from '../models/User.js';

// ─── Payload shapes ───────────────────────────────────────────────────────────

export interface AccessTokenPayload {
  sub: string;    // user._id as string
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: string;    // user._id as string
}

// ─── Access token (15 min) ────────────────────────────────────────────────────

export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
  } catch {
    throw new Error('Invalid or expired access token');
  }
};

// ─── Refresh token (7 days) ───────────────────────────────────────────────────

export const signRefreshToken = (payload: RefreshTokenPayload): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    throw new Error('Invalid or expired refresh token');
  }
};

// ─── Cookie helpers ───────────────────────────────────────────────────────────

/** 7 days in milliseconds — matches the refresh token TTL */
export const REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

export const refreshCookieOptions: import('express').CookieOptions = {
  httpOnly: true,                                    // not accessible via JS
  sameSite: 'strict',                                // CSRF defence
  secure: env.NODE_ENV === 'production',             // HTTPS only in prod
  maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
  path: '/api/auth',                                 // scoped — only sent to auth routes
};
