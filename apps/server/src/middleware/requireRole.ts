import { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../models/User.js';

/**
 * requireRole
 *
 * Role-based access control guard. Must be used AFTER authenticate
 * since it relies on req.user being populated.
 *
 * Usage:
 *   router.post('/', authenticate, requireRole('admin'), handler)
 *
 * Accepts a single role or an array of allowed roles.
 */
export const requireRole = (...allowedRoles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    // authenticate must run first — this is a safety net
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
