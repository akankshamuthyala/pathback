import { z } from 'zod';

export const requestOtpSchema = z.object({
  phoneNumber: z.string().trim().min(5, 'Please enter a valid mobile number.').max(25),
});

export const verifyOtpSchema = z.object({
  phoneNumber: z.string().trim().min(5, 'Please enter a valid mobile number.').max(25),
  otp: z.string().length(6, 'OTP must be exactly 6 digits.').regex(/^\d{6}$/, 'OTP must be numeric.'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(100),
  phoneNumber: z.string().trim().min(5, 'Please enter a valid mobile number.').max(25),
  otp: z.string().length(6, 'OTP must be exactly 6 digits.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  role: z.enum(['public_reporter', 'family_member']).default('public_reporter'),
  organizationName: z.string().optional(),
});

export const loginSchema = z.object({
  phoneNumber: z.string().trim().min(5, 'Phone number is required.'),
  password: z.string().min(6, 'Password is required.'),
});
