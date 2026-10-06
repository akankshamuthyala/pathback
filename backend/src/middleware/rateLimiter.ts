import rateLimit from 'express-rate-limit';

export const otpRequestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes window
  max: 5, // Limit each IP to 5 OTP requests per window
  message: {
    success: false,
    message: 'Too many OTP requests from this address. Please wait 5 minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10, // Limit attempts to prevent brute-forcing
  message: {
    success: false,
    message: 'Too many verification attempts. Please wait 5 minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
