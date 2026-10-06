import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().optional().default(''),
  JWT_ACCESS_SECRET: z.string().min(16).default('sethu_dev_jwt_access_secret_super_secure_key_12345'),
  JWT_REFRESH_SECRET: z.string().min(16).default('sethu_dev_jwt_refresh_secret_super_secure_key_67890'),
  ANTHROPIC_API_KEY: z.string().optional().default(''),
  CLAUDE_MODEL: z.string().default('claude-3-7-sonnet-20250219'),
  SMS_PROVIDER: z.enum(['console_mock', 'twilio', 'fast2sms']).default('console_mock'),
  SMS_API_KEY: z.string().optional().default(''),
  SMS_FROM_NUMBER: z.string().default('+18005550199'),
  STORAGE_PROVIDER: z.enum(['local', 'cloudinary', 'supabase']).default('local'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_ANON_KEY: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  SUPABASE_STORAGE_BUCKET: z.string().default('case-evidence'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  DEV_OTP_MODE: z.string().default('true').transform((val) => val === 'true'),
  DEMO_MODE: z.string().default('true').transform((val) => val === 'true'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Environment configuration validation error:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
