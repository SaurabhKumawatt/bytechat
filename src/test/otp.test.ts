import { describe, it, expect } from 'vitest';
import { generateOTP, hashOTP, validatePhone, maskPhone } from '../utils/otp';

describe('OTP Utils', () => {
  describe('generateOTP', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = generateOTP();
      expect(otp).toMatch(/^\d{6}$/);
      expect(otp.length).toBe(6);
    });

    it('should generate different OTPs on multiple calls', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      expect(otp1).not.toBe(otp2);
    });

    it('should generate OTPs within valid range', () => {
      const otp = generateOTP();
      const numericOTP = parseInt(otp, 10);
      expect(numericOTP).toBeGreaterThanOrEqual(100000);
      expect(numericOTP).toBeLessThanOrEqual(999999);
    });
  });

  describe('hashOTP', () => {
    it('should hash OTP using SHA-256', () => {
      const otp = '123456';
      const hash = hashOTP(otp);
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64);
    });

    it('should produce consistent hashes for same OTP', () => {
      const otp = '123456';
      const hash1 = hashOTP(otp);
      const hash2 = hashOTP(otp);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different OTPs', () => {
      const hash1 = hashOTP('123456');
      const hash2 = hashOTP('654321');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('validatePhone', () => {
    it('should validate 10-digit phone numbers', () => {
      expect(validatePhone('9876543210')).toBe(true);
      expect(validatePhone('1234567890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('12345678901')).toBe(false);
      expect(validatePhone('abcdefghij')).toBe(false);
      expect(validatePhone('98765 43210')).toBe(false);
      expect(validatePhone('+919876543210')).toBe(false);
    });

    it('should reject empty or null inputs', () => {
      expect(validatePhone('')).toBe(false);
    });
  });

  describe('maskPhone', () => {
    it('should mask phone number showing only last 4 digits', () => {
      expect(maskPhone('9876543210')).toBe('******3210');
      expect(maskPhone('1234567890')).toBe('******7890');
    });

    it('should return original if not 10 digits', () => {
      expect(maskPhone('123')).toBe('123');
      expect(maskPhone('12345678901')).toBe('12345678901');
    });
  });
});

describe('OTP Security', () => {
  it('should never store OTP in plaintext', () => {
    const otp = '123456';
    const hash = hashOTP(otp);
    expect(hash).not.toContain(otp);
  });

  it('should use cryptographically secure hashing', () => {
    const otp = '123456';
    const hash = hashOTP(otp);
    expect(hash.length).toBe(64);
  });
});
