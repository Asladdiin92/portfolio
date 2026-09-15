import { Schema, model, Document } from 'mongoose';
import type { Project as IProject } from '@portfolio/shared';

export interface IProjectDocument extends IProject, Document {
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProjectDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    techStack: [{ type: String, required: true }],
    githubUrl: { type: String },
    liveUrl: { type: String },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ProjectModel = model<IProjectDocument>('Project', projectSchema);