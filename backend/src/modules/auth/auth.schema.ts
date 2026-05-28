import z from 'zod';

// Define a schema for user registration using Zod
export const registerSchema = z.object({
  email: z.email(),
  username: z.string().min(3).max(20),
  password: z
    .string()
    .min(6)
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/), // At least one lowercase letter, one uppercase letter, and one number.
  timezone: z.string().min(1).max(50),
});

// Define a schema for user login using Zod
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100),
});

//define a schema for verifying email using Zod
export const verifyEmailSchema = z.object({
  email: z.email(),
  verificationCode: z.string().length(6),
});

// define a schema for forgot password using Zod
export const forgotPasswordSchema = z.object({
  email: z.email(),
});

// define a schema for reset password using Zod

export const resetPasswordSchema = z.object({
  email: z.email(),
  verificationCode: z.string().length(6),
  newPassword: z
    .string()
    .min(6)
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/), // At least one lowercase letter, one uppercase letter, and one number.
});
