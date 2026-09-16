import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { MediaModel } from '../models/Media.js';
import { uploadToCloudinary, deleteFromCloudinary, getCloudinaryUrls } from '../utils/cloudinary.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// Multer — memory storage, 50 MB limit, photos + videos only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

const adminGuard = [authenticate, requireRole('admin')];

// ── GET /api/media — public feed ─────────────────────────────────────────────
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, type, page = '1', limit = '24' } = req.query as Record<string, string>;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(48, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = { isPublic: true };
    if (category && category !== 'All') filter.category  = category;
    if (type     && type     !== 'All') filter.mediaType = type;

    const [items, total] = await Promise.all([
      MediaModel.find(filter).sort({ takenAt: -1 }).skip(skip).limit(limitNum).lean(),
      MediaModel.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: items,
      meta: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) { next(err); }
});

// ── GET /api/media/admin — full feed (admin, includes private) ───────────────
router.get('/admin', ...adminGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, type, page = '1', limit = '48' } = req.query as Record<string, string>;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (category && category !== 'All') filter.category  = category;
    if (type     && type     !== 'All') filter.mediaType = type;

    const [items, total] = await Promise.all([
      MediaModel.find(filter).sort({ takenAt: -1 }).skip(skip).limit(limitNum).lean(),
      MediaModel.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: items,
      meta: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) { next(err); }
});

// ── POST /api/media — upload (admin) ─────────────────────────────────────────
router.post(
  '/',
  ...adminGuard,
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

      const { caption, category, takenAt, isPublic } = req.body as {
        caption:  string;
        category: string;
        takenAt?: string;
        isPublic?: string;
      };

      if (!caption?.trim()) return res.status(400).json({ success: false, message: 'Caption is required.' });
      if (!category)        return res.status(400).json({ success: false, message: 'Category is required.' });

      // Upload file buffer to Cloudinary
      const uploaded = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      const media = await MediaModel.create({
        url:                uploaded.url,
        thumbnailUrl:       uploaded.thumbnailUrl,
        caption:            caption.trim(),
        category,
        mediaType:          uploaded.mediaType,
        isPublic:           isPublic !== 'false',
        cloudinaryPublicId: uploaded.publicId,
        takenAt:            takenAt ? new Date(takenAt) : new Date(),
      });

      return res.status(201).json({ success: true, data: media });
    } catch (err) { next(err); }
  }
);

// ── POST /api/media/from-cloud — save a Cloudinary widget upload (admin) ────
router.post(
  '/from-cloud',
  ...adminGuard,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        secureUrl,
        publicId,
        resourceType,
        caption,
        category,
        takenAt,
        isPublic,
      } = req.body as {
        secureUrl?: string;
        publicId?: string;
        resourceType?: string;
        caption?: string;
        category?: string;
        takenAt?: string;
        isPublic?: boolean;
      };

      if (!secureUrl || !publicId || !['image', 'video'].includes(resourceType ?? '')) {
        return res.status(400).json({ success: false, message: 'Invalid cloud media.' });
      }
      if (!caption?.trim()) {
        return res.status(400).json({ success: false, message: 'Caption is required.' });
      }
      if (!category) {
        return res.status(400).json({ success: false, message: 'Category is required.' });
      }

      const mediaType = resourceType === 'video' ? 'video' : 'photo';
      const urls = getCloudinaryUrls(publicId, mediaType);
      const media = await MediaModel.create({
        url: secureUrl,
        thumbnailUrl: urls.thumbnailUrl,
        caption: caption.trim(),
        category,
        mediaType,
        isPublic: isPublic !== false,
        cloudinaryPublicId: publicId,
        takenAt: takenAt ? new Date(takenAt) : new Date(),
      });

      return res.status(201).json({ success: true, data: media });
    } catch (err) {
      next(err);
    }
  }
);

// ── PATCH /api/media/:id — edit caption / toggle visibility (admin) ──────────
router.patch('/:id', ...adminGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { caption, category, isPublic, takenAt } = req.body as {
      caption?:  string;
      category?: string;
      isPublic?: boolean;
      takenAt?:  string;
    };

    const update: Record<string, unknown> = {};
    if (caption  !== undefined) update.caption  = caption.trim();
    if (category !== undefined) update.category = category;
    if (isPublic !== undefined) update.isPublic = isPublic;
    if (takenAt  !== undefined) update.takenAt  = new Date(takenAt);

    const media = await MediaModel.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!media) return res.status(404).json({ success: false, message: 'Media not found.' });
    return res.json({ success: true, data: media });
  } catch (err) { next(err); }
});

// ── DELETE /api/media/:id — remove from Cloudinary + MongoDB (admin) ─────────
router.delete('/:id', ...adminGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const media = await MediaModel.findById(req.params.id).lean();
    if (!media) return res.status(404).json({ success: false, message: 'Media not found.' });

    // Delete from Cloudinary first
    await deleteFromCloudinary(media.cloudinaryPublicId, media.mediaType);

    await MediaModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Media deleted.' });
  } catch (err) { next(err); }
});

export default router;
