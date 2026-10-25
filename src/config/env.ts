import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string(),
  NODE_ENV: z.string().default("development"),
  LOG_LEVEL: z.string().default("info"),
  DATABASE_URL: z.url("DATABASE_URL must be a valid postgres URL"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().default("30m"),
  CLOUDINARY_CLOUD_NAME: z.string().min(3, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(3, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_SECRET: z.string().min(3, "CLOUDINARY_SECRET is required"),
  REDIS_URL: z.string().min(3, "REDIS_URL is required"),
  GOOGLE_CLIENT_ID: z.string().min(3, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(3, "GOOGLE_CLIENT_SECRET is required"),
  GOOGLE_CALLBACK_URL: z.string().min(3, "GOOGLE_CALLBACK_URL is required"),
});

const parsed = envSchema.parse(process.env);

export const env = {
  port: Number(parsed.PORT ?? 3003),
  isProduction: parsed.NODE_ENV === "production",
  nodeEnv: parsed.NODE_ENV,
  logLevel: parsed.LOG_LEVEL,
  databaseUrl: parsed.DATABASE_URL,
  jwtSecret: parsed.JWT_SECRET,
  jwtExpiresIn: parsed.JWT_EXPIRES_IN,
  cloudinaryCloudName: parsed.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: parsed.CLOUDINARY_API_KEY,
  cloudinarySecret: parsed.CLOUDINARY_SECRET,
  redisUrl: parsed.REDIS_URL,
  googleClientId: parsed.GOOGLE_CLIENT_ID,
  googleClientSecret: parsed.GOOGLE_CLIENT_SECRET,
  googleRedirectUrl: parsed.GOOGLE_CALLBACK_URL,
} as const;
