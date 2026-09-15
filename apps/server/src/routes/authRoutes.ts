import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserModel } from '../models/User.js';
import { validate } from '../middleware/validate.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshCookieOptions,
  REFRESH_TOKEN_COOKIE_NAME,
} from '../utils/token.js';

const router = Router();

// ─── Validation schemas ───────────────────────────────────────────────────────

const RegisterSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'user']).optional(),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Helper: issue both tokens and set the refresh cookie ────────────────────

const issueTokens = (
  res: Response,
  user: { _id: unknown; email: string; role: 'admin' | 'user' }
) => {
  const userId = String(user._id);

  const accessToken = signAccessToken({
    sub: userId,
    email: user.email,
    role: user.role,
  });

  const refreshToken = signRefreshToken({ sub: userId });

  // Store refresh token in HttpOnly cookie — never exposed to client JS
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshCookieOptions);

  return { accessToken, refreshToken };
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post(
  '/register',
  validate(RegisterSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, role } = req.body as z.infer<typeof RegisterSchema>;

      const existing = await UserModel.findOne({ email });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists',
        });
      }

      const user = await UserModel.create({ email, password, role });

      const { accessToken, refreshToken } = issueTokens(res, {
        _id: user._id,
        email: user.email,
        role: user.role,
      });

      // Persist refresh token hash to user document for rotation validation
      user.refreshToken = refreshToken;
      await user.save();

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        accessToken,
        user,  // password + refreshToken stripped via toJSON transform
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  '/login',
  validate(LoginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as z.infer<typeof LoginSchema>;

      // Explicitly select password (excluded from default queries)
      const user = await UserModel.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const { accessToken, refreshToken } = issueTokens(res, {
        _id: user._id,
        email: user.email,
        role: user.role,
      });

      // Rotate refresh token on every login
      user.refreshToken = refreshToken;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        accessToken,
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
router.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token not provided',
        });
      }

      // Verify signature and expiry
      const payload = verifyRefreshToken(token);

      // Check token matches what's stored — detects stolen/reused tokens
      const user = await UserModel.findById(payload.sub);
      if (!user || user.refreshToken !== token) {
        // Token reuse detected — clear the cookie
        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/api/auth' });
        return res.status(401).json({
          success: false,
          message: 'Refresh token invalid or already used',
        });
      }

      // Rotate: issue new pair
      const { accessToken, refreshToken: newRefreshToken } = issueTokens(res, {
        _id: user._id,
        email: user.email,
        role: user.role,
      });

      user.refreshToken = newRefreshToken;
      await user.save();

      return res.status(200).json({
        success: true,
        accessToken,
      });
    } catch (error) {
      // verifyRefreshToken throws on expiry/invalid — treat as 401
      if (error instanceof Error && error.message.includes('refresh token')) {
        return res.status(401).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
);

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post(
  '/logout',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;

      if (token) {
        // Nullify stored token so the refresh cookie can never be reused
        await UserModel.findOneAndUpdate(
          { refreshToken: token },
          { refreshToken: null }
        );
      }

      res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/api/auth' });

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
