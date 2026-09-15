/**
 * Creates (or resets) the admin user account.
 *
 * Usage:
 *   pnpm --filter @portfolio/server create-admin
 *
 * Set ADMIN_EMAIL / ADMIN_PASSWORD env vars to customise credentials,
 * otherwise the defaults below are used.
 *
 * Safe to re-run: upserts the user so it won't create duplicates.
 */

import mongoose from 'mongoose';
import { UserModel } from '../models/User.js';
import { env } from '../config/env.js';

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? 'asladdiinabduqaadir@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@portfolio1';

async function createAdmin() {
  console.log('🔌  Connecting to MongoDB…');
  await mongoose.connect(env.MONGO_URI);
  console.log('✅  Connected.');

  // Check if admin already exists
  const existing = await UserModel.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    // Update password + ensure role is admin
    existing.password = ADMIN_PASSWORD; // pre-save hook will hash it
    existing.role     = 'admin';
    await existing.save();
    console.log(`✅  Admin account updated: ${ADMIN_EMAIL}`);
  } else {
    await UserModel.create({
      email:    ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role:     'admin',
    });
    console.log(`✅  Admin account created: ${ADMIN_EMAIL}`);
  }

  console.log(`🔑  Password: ${ADMIN_PASSWORD}`);
  console.log('⚠️   Change the password after first login in production!');

  await mongoose.disconnect();
  console.log('🔌  Disconnected. Done.');
}

createAdmin().catch((err) => {
  console.error('❌  Failed:', err);
  process.exit(1);
});
