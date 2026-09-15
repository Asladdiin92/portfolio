import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { SiteConfigModel, DEFAULT_CONFIG } from '../models/SiteConfig.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router     = Router();
const adminGuard = [authenticate, requireRole('admin')];

// Multer — memory storage, images only, 10 MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

// ── Ensure all default keys exist on startup ──────────────────────────────────
export async function seedDefaultConfig() {
  for (const { key, label } of DEFAULT_CONFIG) {
    await SiteConfigModel.findOneAndUpdate(
      { key },
      { $setOnInsert: { key, label, value: '' } },
      { upsert: true, new: true }
    );
  }
}

// ── GET /api/config — public, returns all config as { key: value } map ───────
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const configs = await SiteConfigModel.find().lean();
    const map: Record<string, string> = {};
    configs.forEach((c) => { map[c.key] = c.value; });
    return res.json({ success: true, data: map });
  } catch (err) { next(err); }
});

// ── GET /api/config/full — admin, returns full documents with labels ──────────
router.get('/full', ...adminGuard, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const configs = await SiteConfigModel.find().sort({ key: 1 }).lean();
    return res.json({ success: true, data: configs });
  } catch (err) { next(err); }
});

// ── PATCH /api/config/:key — admin, update a text value ──────────────────────
router.patch('/:key', ...adminGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value } = req.body as { value: string };
    const updated = await SiteConfigModel.findOneAndUpdate(
      { key: req.params.key },
      { $set: { value } },
      { new: true, upsert: true }
    ).lean();
    return res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// ── POST /api/config/:key/image — admin, upload image to Cloudinary ───────────
router.post(
  '/:key/image',
  ...adminGuard,
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file provided.' });
      }

      const uploaded = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      const updated = await SiteConfigModel.findOneAndUpdate(
        { key: req.params.key },
        { $set: { value: uploaded.url } },
        { new: true, upsert: true }
      ).lean();

      return res.json({ success: true, data: updated, url: uploaded.url });
    } catch (err) { next(err); }
  }
);

export default router;
