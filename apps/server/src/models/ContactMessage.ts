import { Schema, model, Document } from 'mongoose';

export interface IContactMessage {
  name:      string;
  email:     string;
  message:   string;
  read:      boolean;
  ipAddress?: string;
}

export interface IContactMessageDocument extends IContactMessage, Document {
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<IContactMessageDocument>(
  {
    name:      { type: String, required: true, trim: true, maxlength: 100 },
    email:     { type: String, required: true, trim: true, lowercase: true },
    message:   { type: String, required: true, trim: true, maxlength: 2000 },
    read:      { type: Boolean, default: false },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

// Index for admin inbox — newest first, unread first
contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ read: 1, createdAt: -1 });

export const ContactMessageModel = model<IContactMessageDocument>(
  'ContactMessage',
  contactMessageSchema
);
