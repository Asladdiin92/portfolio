import { Schema, model, Document } from 'mongoose';

export interface ISiteConfig {
  key:   string;
  value: string;
  label: string; // human-readable label for the admin UI
}

export interface ISiteConfigDocument extends ISiteConfig, Document {
  updatedAt: Date;
}

const siteConfigSchema = new Schema<ISiteConfigDocument>(
  {
    key:   { type: String, required: true, unique: true, trim: true },
    value: { type: String, default: '' },
    label: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const SiteConfigModel = model<ISiteConfigDocument>('SiteConfig', siteConfigSchema);

// ── Default config keys ───────────────────────────────────────────────────────
export const DEFAULT_CONFIG: Array<Pick<ISiteConfig, 'key' | 'label'>> = [
  // ── About section card images ──────────────────────────────────────────────
  { key: 'card_img_location',  label: 'Location card image'            },
  { key: 'card_img_about',     label: 'About Me card image'            },
  { key: 'card_img_learning',  label: 'Currently Learning card image'  },
  { key: 'card_img_education', label: 'Education card image'           },
  { key: 'card_img_growth',    label: 'GROWTH card image'              },
  { key: 'card_img_focus',     label: 'FOCUS card image'               },
  { key: 'card_img_craft',     label: 'CRAFT card image'               },
  // ── Experience ────────────────────────────────────────────────────────────
  { key: 'exp_campus_photo',   label: 'Experience — Campus photo'      },
  // ── Hero content ──────────────────────────────────────────────────────────
  { key: 'hero_name_first',          label: 'Hero — First name'                },
  { key: 'hero_name_last',           label: 'Hero — Last name'                 },
  { key: 'hero_badge',               label: 'Hero — Status badge text'         },
  { key: 'hero_tags',                label: 'Hero — Role tags (· separated)'   },
  { key: 'hero_bio',                 label: 'Hero — Bio paragraph'             },
  { key: 'hero_typewriter_words',    label: 'Hero — Typewriter words (comma-separated)' },
  { key: 'hero_profile_image',       label: 'Hero — Profile photo card image'   },
  { key: 'hero_bg_image',            label: 'Hero — Full-screen background image' },
  { key: 'hero_cta_primary',         label: 'Hero — Primary CTA label'         },
  { key: 'hero_cta_secondary',       label: 'Hero — Secondary CTA label'       },
  { key: 'hero_badge1',              label: 'Hero — Floating badge 1'          },
  { key: 'hero_badge2',              label: 'Hero — Floating badge 2'          },
  { key: 'hero_badge3',              label: 'Hero — Floating badge 3'          },
  { key: 'hero_badge4',              label: 'Hero — Floating badge 4'          },
];
