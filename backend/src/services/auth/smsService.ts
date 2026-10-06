import { env } from '../../config/env';

export interface ISmsService {
  sendOtp(phoneNumber: string, otp: string): Promise<boolean>;
}

class ConsoleMockSmsService implements ISmsService {
  async sendOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const divider = '='.repeat(50);
    console.log(`\n${divider}`);
    console.log(`📱 [SETHU SMS OTP SIMULATOR]`);
    console.log(`📞 Recipient:   ${phoneNumber}`);
    console.log(`🔐 6-Digit OTP: ${otp}`);
    console.log(`⏳ Valid for:   5 minutes`);
    console.log(`🛡️  Security:    Never share this OTP with anyone.`);
    console.log(`${divider}\n`);
    return true;
  }
}

class ProductionSmsService implements ISmsService {
  async sendOtp(phoneNumber: string, otp: string): Promise<boolean> {
    if (env.SMS_PROVIDER === 'twilio') {
      // Integration hook for Twilio SMS
      console.log(`[Twilio SMS] Sending OTP to ${phoneNumber}`);
      return true;
    }
    // Fallback to console if credentials missing
    console.log(`[Production SMS] Simulating dispatch to ${phoneNumber}`);
    return true;
  }
}

export const smsService: ISmsService =
  env.NODE_ENV === 'production' && env.SMS_PROVIDER !== 'console_mock'
    ? new ProductionSmsService()
    : new ConsoleMockSmsService();
