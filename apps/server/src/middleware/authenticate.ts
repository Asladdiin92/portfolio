import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type AccessTokenPayload } from '../utils/token.js';

// Extend Express Request so downstream handlers get typed access to the user
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

/**
 * authenticate
 *
 * Extracts the Bearer token from the Authorization header, verifies it,
 * and attaches the decoded payload to req.user.
 *
 * On failure returns 401 — never calls next(error) so auth failures
 * don't leak stack traces through the global error handler.
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authorization header missing or malformed',
    });
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Access token invalid or expired',
    });
  }
};
