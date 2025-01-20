import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.string().default('3000'),
  CSV_FILE: z.string(),
});

export const env = envSchema.parse(process.env);
