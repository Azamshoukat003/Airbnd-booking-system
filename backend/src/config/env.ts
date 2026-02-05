import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_KEY: z.string().min(1),
  BANCARD_API_URL: z.string().url(),
  BANCARD_MERCHANT_ID: z.string().min(1),
  BANCARD_PUBLIC_KEY: z.string().min(1),
  BANCARD_PRIVATE_KEY: z.string().min(1),
  BANCARD_WEBHOOK_SECRET: z.string().min(1),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_URL: z.string().url(),
  ADMIN_DASHBOARD_URL: z.string().url(),
  SYNC_INTERVAL_MINUTES: z.coerce.number().int().min(5).max(60).default(15),
  JWT_SECRET: z.string().min(1),
  PAYMENT_MODE: z.enum(['stub', 'live']).default('stub')
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export type Env = z.infer<typeof envSchema>;
