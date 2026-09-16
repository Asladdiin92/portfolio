import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'user';

export interface IUser {
  email: string;
  password: string;
  role: UserRole;
  refreshToken?: string;
}

export interface IUserDocument extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
  /** Compare a plaintext candidate against the stored hash */
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    // Stores the current valid refresh token — nulled out on logout
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// ─── Pre-save hook: hash password only when it has been modified ─────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Cost factor 12 per doc spec (WBS 2.3.1)
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Instance method: safe constant-time comparison ──────────────────────────
userSchema.methods.comparePassword = function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// Never return the password or refreshToken in any JSON response
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { password: _password, refreshToken: _refreshToken, ...safeUser } = ret;
    return safeUser;
  },
});

export const UserModel = model<IUserDocument>('User', userSchema);
