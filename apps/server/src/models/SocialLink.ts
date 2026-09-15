import { Schema, model, Document } from 'mongoose';

export interface ISocialLink {
  label:    string;   // "GitHub", "Telegram", custom name
  url:      string;   // full URL or mailto:/tel:
  platform: string;   // lowercase key e.g. "github", "telegram", "custom"
  icon:     string;   // emoji or empty (SVG handled client-side by platform key)
  order:    number;   // display order
  visible:  boolean;  // show/hide without deleting
  showInHero:    boolean; // show in Hero social row
  showInContact: boolean; // show in Contact section
}

export interface ISocialLinkDocument extends ISocialLink, Document {
  createdAt: Date;
  updatedAt: Date;
}

const socialLinkSchema = new Schema<ISocialLinkDocument>(
  {
    label:         { type: String, required: true, trim: true },
    url:           { type: String, required: true, trim: true },
    platform:      { type: String, required: true, trim: true, lowercase: true },
    icon:          { type: String, default: '' },
    order:         { type: Number, default: 0 },
    visible:       { type: Boolean, default: true },
    showInHero:    { type: Boolean, default: true },
    showInContact: { type: Boolean, default: true },
  },
  { timestamps: true }
);

socialLinkSchema.index({ order: 1, visible: 1 });

export const SocialLinkModel = model<ISocialLinkDocument>('SocialLink', socialLinkSchema);

// ── Default links seeded on first run ─────────────────────────────────────────
export const DEFAULT_SOCIAL_LINKS: Omit<ISocialLink, never>[] = [
  { label: 'Email',    url: 'mailto:asladdiinabduqaadir@gmail.com', platform: 'email',    icon: '',   order: 0, visible: true, showInHero: true,  showInContact: true  },
  { label: 'GitHub',   url: 'https://github.com/Asladdiin92',       platform: 'github',   icon: '',   order: 1, visible: true, showInHero: true,  showInContact: true  },
  { label: 'X',        url: 'https://x.com/asladin15',              platform: 'x',        icon: '',   order: 2, visible: true, showInHero: true,  showInContact: true  },
  { label: 'Facebook', url: 'https://facebook.com/asladdiin',       platform: 'facebook', icon: '',   order: 3, visible: true, showInHero: false, showInContact: true  },
  { label: 'TikTok',   url: 'https://tiktok.com/@asladdiinabduqaadir', platform: 'tiktok', icon: '',  order: 4, visible: true, showInHero: false, showInContact: true  },
  { label: 'Phone',    url: 'tel:+251992947709',                    platform: 'phone',    icon: '📞', order: 5, visible: true, showInHero: false, showInContact: true  },
];
