import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { SocialLinkModel, DEFAULT_SOCIAL_LINKS } from '../models/SocialLink.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router     = Router();
const adminGuard = [authenticate, requireRole('admin')];

// ── Seed default links if collection is empty ─────────────────────────────────
export async function seedDefaultSocials() {
  const count = await SocialLinkModel.countDocuments();
  if (count === 0) {
    await SocialLinkModel.insertMany(DEFAULT_SOCIAL_LINKS);
  }
}

const SocialSchema = z.object({
  label:         z.string().min(1).max(50),
  url:           z.string().min(1),
  platform:      z.string().min(1).max(50),
  icon:          z.string().max(10).default(''),
  order:         z.number().int().default(0),
  visible:       z.boolean().default(true),
  showInHero:    z.boolean().default(true),
  showInContact: z.boolean().default(true),
});

// ── GET /api/socials — public, visible links sorted by order ──────────────────
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const links = await SocialLinkModel
      .find({ visible: true })
      .sort({ order: 1 })
      .lean();
    return res.json({ success: true, data: links });
  } catch (err) { next(err); }
});

// ── GET /api/socials/all — admin, all links including hidden ──────────────────
router.get('/all', ...adminGuard, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const links = await SocialLinkModel.find().sort({ order: 1 }).lean();
    return res.json({ success: true, data: links });
  } catch (err) { next(err); }
});

// ── POST /api/socials — admin, create new link ────────────────────────────────
router.post('/', ...adminGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = SocialSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    }
    const link = await SocialLinkModel.create(parsed.data);
    return res.status(201).json({ success: true, data: link });
  } catch (err) { next(err); }
});

// ── PATCH /api/socials/:id — admin, update any field ─────────────────────────
router.patch('/:id', ...adminGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const link = await SocialLinkModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();
    if (!link) return res.status(404).json({ success: false, message: 'Link not found.' });
    return res.json({ success: true, data: link });
  } catch (err) { next(err); }
});

// ── POST /api/socials/reorder — admin, bulk update order ─────────────────────
router.post('/reorder', ...adminGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body as { ids: string[] };
    if (!Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'ids must be an array.' });
    }
    await Promise.all(
      ids.map((id, index) => SocialLinkModel.findByIdAndUpdate(id, { $set: { order: index } }))
    );
    return res.json({ success: true });
  } catch (err) { next(err); }
});

// ── DELETE /api/socials/:id — admin, delete link ──────────────────────────────
router.delete('/:id', ...adminGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const link = await SocialLinkModel.findByIdAndDelete(req.params.id).lean();
    if (!link) return res.status(404).json({ success: false, message: 'Link not found.' });
    return res.json({ success: true, message: 'Deleted.' });
  } catch (err) { next(err); }
});

export default router;
