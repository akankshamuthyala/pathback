import { Request, Response } from 'express';
import { User } from '../models/User';
import { OtpChallenge } from '../models/OtpChallenge';
import { generateOtp, hashOtp, verifyOtpHash } from '../utils/otp';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { smsService } from '../services/auth/smsService';
import { createAuditLog } from '../utils/auditLogger';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../types';
import { requestOtpSchema, verifyOtpSchema, registerSchema, loginSchema } from '../validators/authValidators';

export const requestOtp = async (req: Request, res: Response): Promise<void> => {
  const parsed = requestOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid phone number format.', errors: parsed.error.format() });
    return;
  }

  const { phoneNumber } = parsed.data;

  // Rate check: maximum requests in 5 minutes
  const existingChallenge = await OtpChallenge.findOne({ phoneNumber });
  if (existingChallenge && existingChallenge.requestCount >= 5 && existingChallenge.expiresAt > new Date()) {
    res.status(429).json({
      success: false,
      message: 'Too many OTP requests for this number. Please wait a few minutes before trying again.',
    });
    return;
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

  if (existingChallenge) {
    existingChallenge.otpHash = otpHash;
    existingChallenge.expiresAt = expiresAt;
    existingChallenge.attempts = 0;
    existingChallenge.requestCount += 1;
    existingChallenge.verifiedAt = undefined;
    await existingChallenge.save();
  } else {
    await OtpChallenge.create({
      phoneNumber,
      otpHash,
      expiresAt,
      attempts: 0,
      requestCount: 1,
    });
  }

  await smsService.sendOtp(phoneNumber, otp);

  await createAuditLog({
    role: 'anonymous',
    action: 'OTP_REQUESTED',
    entityType: 'OtpChallenge',
    entityId: phoneNumber,
    reason: 'User requested mobile verification challenge',
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'OTP challenge generated and dispatched to your mobile number.',
    expiresInSeconds: 300,
    // Development helper: expose OTP only in local dev mode when configured
    ...(env.DEV_OTP_MODE ? { devOtp: otp } : {}),
  });
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid OTP payload.', errors: parsed.error.format() });
    return;
  }

  const { phoneNumber, otp } = parsed.data;

  const challenge = await OtpChallenge.findOne({ phoneNumber });
  if (!challenge) {
    res.status(400).json({ success: false, message: 'No active OTP challenge found for this phone number. Please request a new code.' });
    return;
  }

  if (challenge.expiresAt < new Date()) {
    res.status(400).json({ success: false, message: 'This OTP has expired. Please request a new code.' });
    return;
  }

  if (challenge.attempts >= 5) {
    res.status(429).json({ success: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' });
    return;
  }

  const isValid = verifyOtpHash(otp, challenge.otpHash);
  if (!isValid) {
    challenge.attempts += 1;
    await challenge.save();
    res.status(400).json({
      success: false,
      message: `Incorrect verification code. ${5 - challenge.attempts} attempts remaining.`,
    });
    return;
  }

  challenge.verifiedAt = new Date();
  await challenge.save();

  await createAuditLog({
    role: 'anonymous',
    action: 'OTP_VERIFIED',
    entityType: 'OtpChallenge',
    entityId: phoneNumber,
    reason: 'Mobile number successfully verified via cryptographic challenge',
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Phone number verified successfully.',
    verified: true,
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Registration validation failed.', errors: parsed.error.format() });
    return;
  }

  const { name, phoneNumber, otp, password, role, organizationName } = parsed.data;

  // Validate OTP was verified
  const challenge = await OtpChallenge.findOne({ phoneNumber });
  if (!challenge || !challenge.verifiedAt || !verifyOtpHash(otp, challenge.otpHash)) {
    res.status(400).json({ success: false, message: 'Mobile verification required before completing registration.' });
    return;
  }

  // Check existing user
  const existingUser = await User.findOne({ phoneNumber });
  if (existingUser) {
    res.status(409).json({ success: false, message: 'An account with this mobile number already exists. Please log in.' });
    return;
  }

  const passwordHash = await hashPassword(password);

  const newUser = await User.create({
    name,
    phoneNumber,
    passwordHash,
    role,
    isPhoneVerified: true,
    status: 'active',
    organizationName,
  });

  // Consume challenge
  await OtpChallenge.deleteOne({ phoneNumber });

  const tokenPayload = {
    userId: newUser._id.toString(),
    phoneNumber: newUser.phoneNumber,
    role: newUser.role,
    name: newUser.name,
  };

  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ userId: newUser._id.toString() });

  await createAuditLog({
    actorId: newUser._id.toString(),
    actorName: newUser.name,
    role: newUser.role,
    action: 'USER_REGISTERED',
    entityType: 'User',
    entityId: newUser._id.toString(),
    reason: `New account created with role ${newUser.role}`,
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    message: 'Account successfully registered and authenticated.',
    user: {
      id: newUser._id,
      name: newUser.name,
      phoneNumber: newUser.phoneNumber,
      role: newUser.role,
      organizationName: newUser.organizationName,
    },
    accessToken,
    refreshToken,
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Please provide phone number and password.' });
    return;
  }

  const { phoneNumber, password } = parsed.data;

  const user = await User.findOne({ phoneNumber });
  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid credentials. Account not found.' });
    return;
  }

  if (user.status === 'suspended') {
    res.status(403).json({ success: false, message: 'Account is temporarily suspended. Please contact platform administrators.' });
    return;
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    return;
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokenPayload = {
    userId: user._id.toString(),
    phoneNumber: user.phoneNumber,
    role: user.role,
    name: user.name,
  };

  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ userId: user._id.toString() });

  await createAuditLog({
    actorId: user._id.toString(),
    actorName: user.name,
    role: user.role,
    action: 'USER_LOGIN',
    entityType: 'User',
    entityId: user._id.toString(),
    reason: 'User session authenticated successfully',
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Session authenticated successfully.',
    user: {
      id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      organizationName: user.organizationName,
      badgeNumber: user.badgeNumber,
    },
    accessToken,
    refreshToken,
  });
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body;
  if (!token) {
    res.status(400).json({ success: false, message: 'Refresh token is required.' });
    return;
  }

  try {
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.userId);
    if (!user || user.status !== 'active') {
      res.status(401).json({ success: false, message: 'User session is no longer active.' });
      return;
    }

    const newAccessToken = signAccessToken({
      userId: user._id.toString(),
      phoneNumber: user.phoneNumber,
      role: user.role,
      name: user.name,
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthenticated.' });
    return;
  }

  const user = await User.findById(req.user.userId).select('-passwordHash');
  if (!user) {
    res.status(404).json({ success: false, message: 'User record not found.' });
    return;
  }

  res.json({
    success: true,
    user,
  });
};
