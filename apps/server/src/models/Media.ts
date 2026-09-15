import { Schema, model, Document } from 'mongoose';

export type MediaType = 'photo' | 'video';
export type MediaCategory =
  | 'Campus'
  | 'Projects'
  | 'Events'
  | 'Community'
  | 'Personal'
  | 'Tech';

export interface IMedia {
  url: string;
  thumbnailUrl: string;
  caption: string;
  category: MediaCategory;
  mediaType: MediaType;
  isPublic: boolean;
  cloudinaryPublicId: string;
  takenAt: Date;
}

export interface IMediaDocument extends IMedia, Document {
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<IMediaDocument>(
  {
    url:                { type: String, required: true },
    thumbnailUrl:       { type: String, required: true },
    caption:            { type: String, required: true, trim: true, maxlength: 280 },
    category:           {
      type: String,
      required: true,
      enum: ['Campus', 'Projects', 'Events', 'Community', 'Personal', 'Tech'],
    },
    mediaType:          { type: String, required: true, enum: ['photo', 'video'] },
    isPublic:           { type: Boolean, default: true },
    cloudinaryPublicId: { type: String, required: true },
    takenAt:            { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for fast public feed queries
mediaSchema.index({ isPublic: 1, takenAt: -1 });
mediaSchema.index({ category: 1, isPublic: 1 });

export const MediaModel = model<IMediaDocument>('Media', mediaSchema);
