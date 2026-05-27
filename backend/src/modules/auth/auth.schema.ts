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

export type RegisterRequest = z.infer<typeof registerSchema>; // Create a TypeScript type based on the Zod schema for registration
export type LoginRequest = z.infer<typeof loginSchema>; //  Create a TypeScript type based on the Zod schema for login
export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>; // Create a TypeScript type based on the Zod schema for email verification
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>; // Create a TypeScript type based on the Zod schema for forgot password
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>; // Create a TypeScript type based on the Zod schema for reset password
