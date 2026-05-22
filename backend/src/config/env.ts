import z from 'zod';

// Define a schema for environment variables using Zod
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('5000').transform(Number),
  DATABASE_URL: z.string().min(1),
  Direct_URL: z.string().min(1),
  JWT_SECRET: z.string().min(64).max(128),
  RESEND_API_KEY: z.string().min(32).max(64),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  CORS_ORIGIN: z.string(),
});

type Env = z.infer<typeof envSchema>; // create type of env variables based on the schema

let env: Env;

const result = envSchema.safeParse(process.env); // Validate and parse environment variables

if (!result.success) {
  console.error('Invalid environment variables:', result.error.issues);
  process.exit(1);
} else {
  env = result.data;
}

export { env };
