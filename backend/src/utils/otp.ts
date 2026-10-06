import crypto from 'crypto';

export const generateOtp = (): string => {
  // Generate cryptographically secure 6-digit numeric OTP
  return Math.floor(100000 + crypto.randomInt(900000)).toString();
};

export const hashOtp = (otp: string, salt: string = 'sethu_otp_salt'): string => {
  return crypto.createHmac('sha256', salt).update(otp).digest('hex');
};

export const verifyOtpHash = (otp: string, hash: string, salt: string = 'sethu_otp_salt'): boolean => {
  const calculatedHash = hashOtp(otp, salt);
  return crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(hash));
};
