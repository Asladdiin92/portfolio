import { Router, Request, Response, NextFunction } from 'express';
import { ProjectModel } from '../models/Project.js';
import { validate } from '../middleware/validate.js';
import { cacheRepository } from '../repositories/cacheRepository.js';
import { ProjectSchema } from '@portfolio/shared';

const router = Router();

// Cache key constants — centralised so invalidation stays in sync
const CACHE_KEYS = {
  allProjects: 'projects:all',
  projectsPattern: 'projects:*',
} as const;

// Cache TTL: 60 seconds for the public project listing
const PROJECTS_TTL = 60;

// GET /api/projects — look-aside cached read
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Check cache first
    const cached = await cacheRepository.get<typeof projects>(CACHE_KEYS.allProjects);
    if (cached) {
      return res.status(200).json({
        success: true,
        count: cached.length,
        data: cached,
        source: 'cache',
      });
    }

    // 2. Cache miss — query MongoDB
    const projects = await ProjectModel.find().sort({ createdAt: -1 }).lean();

    // 3. Populate cache for subsequent requests
    await cacheRepository.set(CACHE_KEYS.allProjects, projects, PROJECTS_TTL);

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
      source: 'db',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:id — single project
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = `projects:${req.params.id}`;
    const cached = await cacheRepository.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: cached, source: 'cache' });
    }

    const project = await ProjectModel.findById(req.params.id).lean();
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await cacheRepository.set(cacheKey, project, PROJECTS_TTL);
    return res.status(200).json({ success: true, data: project, source: 'db' });
  } catch (error) {
    next(error);
  }
});

// POST /api/projects — create and invalidate the listing cache
router.post(
  '/',
  validate(ProjectSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newProject = await ProjectModel.create(req.body);

      // Invalidate all project cache variants so next GET reflects the new data
      await cacheRepository.invalidatePattern(CACHE_KEYS.projectsPattern);

      return res.status(201).json({ success: true, data: newProject });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/projects/:id — remove and invalidate cache
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await ProjectModel.findByIdAndDelete(req.params.id).lean();
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    await cacheRepository.invalidatePattern(CACHE_KEYS.projectsPattern);
    return res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/projects/:id — update project
router.put('/:id', validate(ProjectSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await ProjectModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    await cacheRepository.invalidatePattern(CACHE_KEYS.projectsPattern);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
