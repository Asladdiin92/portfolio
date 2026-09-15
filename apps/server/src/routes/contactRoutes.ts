import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ContactMessageModel } from '../models/ContactMessage.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router     = Router();
const adminGuard = [authenticate, requireRole('admin')];

// ── Validation schema ─────────────────────────────────────────────────────────
const ContactSchema = z.object({
  name:    z.string().min(2,  'Name must be at least 2 characters').max(100),
  email:   z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

// ── POST /api/contact — public, submit a message ──────────────────────────────
router.post(
  '/',
  validate(ContactSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, message } = req.body as z.infer<typeof ContactSchema>;

      const ip = (
        req.headers['x-forwarded-for'] as string ||
        req.socket.remoteAddress ||
        ''
      ).split(',')[0].trim();

      await ContactMessageModel.create({ name, email, message, ipAddress: ip });

      return res.status(201).json({
        success: true,
        message: 'Message received. I\'ll get back to you soon!',
      });
    } catch (err) { next(err); }
  }
);

// ── GET /api/contact — admin, list all messages ───────────────────────────────
router.get(
  '/',
  ...adminGuard,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = '1', limit = '20', unread } = req.query as Record<string, string>;
      const pageNum  = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
      const skip     = (pageNum - 1) * limitNum;

      const filter: Record<string, unknown> = {};
      if (unread === 'true') filter.read = false;

      const [messages, total, unreadCount] = await Promise.all([
        ContactMessageModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        ContactMessageModel.countDocuments(filter),
        ContactMessageModel.countDocuments({ read: false }),
      ]);

      return res.json({
        success: true,
        data: messages,
        meta: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum), unreadCount },
      });
    } catch (err) { next(err); }
  }
);

// ── PATCH /api/contact/:id/read — mark as read ────────────────────────────────
router.patch(
  '/:id/read',
  ...adminGuard,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const msg = await ContactMessageModel.findByIdAndUpdate(
        req.params.id,
        { $set: { read: true } },
        { new: true }
      ).lean();
      if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });
      return res.json({ success: true, data: msg });
    } catch (err) { next(err); }
  }
);

// ── DELETE /api/contact/:id — admin delete ────────────────────────────────────
router.delete(
  '/:id',
  ...adminGuard,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const msg = await ContactMessageModel.findByIdAndDelete(req.params.id).lean();
      if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });
      return res.json({ success: true, message: 'Message deleted.' });
    } catch (err) { next(err); }
  }
);

export default router;
