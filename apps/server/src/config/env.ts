import { z } from 'zod';
import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Load .env in development; Railway injects vars directly in production
dotenv.config();
dotenv.config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env'),
});

const isProd = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Railway sets PORT automatically — always use it
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),

  // MongoDB Atlas — required in production, has local default for dev
  MONGO_URI: isProd
    ? z.string().min(1, 'MONGO_URI is required in production')
    : z.string().default('mongodb://admin:secret_password@localhost:27017/portfolio_db?authSource=admin'),

  // Redis — Railway Redis plugin sets REDIS_URL automatically
  REDIS_URL: z.string().default('redis://:redis_secret@localhost:6379'),

  // JWT — required in production
  JWT_SECRET: isProd
    ? z.string().min(32, 'JWT_SECRET must be at least 32 characters')
    : z.string().min(32).default('super_secret_jwt_key_that_is_32_characters_long'),
  JWT_REFRESH_SECRET: isProd
    ? z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters')
    : z.string().min(32).default('super_secret_refresh_key_32_chars_long!!'),

  JWT_ACCESS_EXPIRES_IN:  z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS — set to your Vercel URL in production
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().default('lvf8z9ck'),
  CLOUDINARY_API_KEY:    z.string().default('644541983224625'),
  CLOUDINARY_API_SECRET: z.string().default('pzg2KikCiRrWU9JWrdZsowoeFR0'),
});

const parseEnvironment = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌  Environment Variable Error:');
    result.error.issues.forEach((i) => console.error(`   ${i.path.join('.')}: ${i.message}`));
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnvironment();
