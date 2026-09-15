import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  MONGO_URI: z.string().default('mongodb://admin:secret_password@localhost:27017/portfolio_db?authSource=admin'),
  REDIS_URL: z.string().default('redis://:redis_secret@localhost:6379'),
  JWT_SECRET: z.string().min(32).default('super_secret_jwt_key_that_is_32_characters_long'),
  JWT_REFRESH_SECRET: z.string().min(32).default('super_secret_refresh_key_32_chars_long!!'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().default('lvf8z9ck'),
  CLOUDINARY_API_KEY: z.string().default('644541983224625'),
  CLOUDINARY_API_SECRET: z.string().default('pzg2KikCiRrWU9JWrdZsowoeFR0'),
});

const parseEnvironment = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment Variable Parsing Error:', JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnvironment();