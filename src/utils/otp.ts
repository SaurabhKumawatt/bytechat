import axios from 'axios';
import CryptoJS from 'crypto-js';

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashOTP = (otp: string): string => {
  return CryptoJS.SHA256(otp).toString();
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

export const sendOTPViaSMS = async (phone: string, otp: string): Promise<void> => {
  const FAST2SMS_API_KEY = import.meta.env.VITE_FAST2SMS_API_KEY;

  if (!FAST2SMS_API_KEY) {
    console.warn('Fast2SMS API key not configured. OTP:', otp);
    return;
  }

  try {
    const url = 'https://www.fast2sms.com/dev/bulkV2';
    const payload = {
      route: 'v3',
      sender_id: 'TXTIND',
      message: `Your ByteChat OTP is ${otp}. Valid for 2 minutes. Do not share this code.`,
      language: 'english',
      numbers: phone,
    };

    await axios.post(url, payload, {
      headers: {
        authorization: FAST2SMS_API_KEY,
      },
    });
  } catch (error) {
    console.error('Fast2SMS Error:', error);
    throw new Error('Failed to send OTP SMS');
  }
};

export const maskPhone = (phone: string): string => {
  if (phone.length !== 10) return phone;
  return `******${phone.slice(-4)}`;
};
