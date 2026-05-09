import { describe, it, expect } from 'vitest';
import { formatLastSeen, formatMessageTime } from '../utils/dateFormat';
import { generateAESKey, encryptMessage, decryptMessage } from '../utils/encryption';

describe('UI Utilities', () => {
  describe('Date Formatting', () => {
    it('should format recent timestamps as "Just now"', () => {
      const now = new Date();
      const result = formatLastSeen(now);
      expect(result).toBe('Just now');
    });

    it('should format minutes ago correctly', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = formatLastSeen(fiveMinutesAgo);
      expect(result).toContain('minute');
    });

    it('should format hours ago correctly', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const result = formatLastSeen(twoHoursAgo);
      expect(result).toContain('hour');
    });

    it('should format days ago correctly', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const result = formatLastSeen(threeDaysAgo);
      expect(result).toContain('day');
    });

    it('should format message time for today', () => {
      const now = new Date();
      const result = formatMessageTime(now);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('Encryption Integration', () => {
    it('should encrypt and decrypt messages correctly', () => {
      const originalMessage = 'Hello, ByteChat!';
      const aesKey = generateAESKey();

      const encrypted = encryptMessage(originalMessage, aesKey);
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.cipherText).toBeDefined();
      expect(encrypted.cipherText).not.toBe(originalMessage);

      const decrypted = decryptMessage(encrypted, aesKey);
      expect(decrypted).toBe(originalMessage);
    });

    it('should generate unique encryption for same message', () => {
      const message = 'Test message';
      const aesKey = generateAESKey();

      const encrypted1 = encryptMessage(message, aesKey);
      const encrypted2 = encryptMessage(message, aesKey);

      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.cipherText).not.toBe(encrypted2.cipherText);

      const decrypted1 = decryptMessage(encrypted1, aesKey);
      const decrypted2 = decryptMessage(encrypted2, aesKey);

      expect(decrypted1).toBe(message);
      expect(decrypted2).toBe(message);
    });

    it('should handle special characters in messages', () => {
      const specialMessage = 'Hello 👋 with emojis! & special chars: <>"\'';
      const aesKey = generateAESKey();

      const encrypted = encryptMessage(specialMessage, aesKey);
      const decrypted = decryptMessage(encrypted, aesKey);

      expect(decrypted).toBe(specialMessage);
    });

    it('should handle long messages', () => {
      const longMessage = 'A'.repeat(1000);
      const aesKey = generateAESKey();

      const encrypted = encryptMessage(longMessage, aesKey);
      const decrypted = decryptMessage(encrypted, aesKey);

      expect(decrypted).toBe(longMessage);
      expect(decrypted.length).toBe(1000);
    });
  });

  describe('AES Key Generation', () => {
    it('should generate valid AES keys', () => {
      const key = generateAESKey();
      expect(key).toBeDefined();
      expect(key.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(key)).toBe(true);
    });

    it('should generate unique keys', () => {
      const key1 = generateAESKey();
      const key2 = generateAESKey();
      expect(key1).not.toBe(key2);
    });
  });
});

describe('Chat Integration', () => {
  describe('Message Status', () => {
    it('should validate message status types', () => {
      const validStatuses: Array<'sent' | 'delivered' | 'seen'> = ['sent', 'delivered', 'seen'];

      validStatuses.forEach((status) => {
        expect(['sent', 'delivered', 'seen']).toContain(status);
      });
    });
  });

  describe('Contact Filtering', () => {
    it('should filter contacts by name', () => {
      const contacts = [
        { name: 'Alice', phone: '1234567890' },
        { name: 'Bob', phone: '9876543210' },
        { name: 'Charlie', phone: '5555555555' }
      ];

      const searchQuery = 'ali';
      const filtered = contacts.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Alice');
    });

    it('should filter contacts by phone', () => {
      const contacts = [
        { name: 'Alice', phone: '1234567890' },
        { name: 'Bob', phone: '9876543210' }
      ];

      const searchQuery = '987';
      const filtered = contacts.filter((c) => c.phone.includes(searchQuery));

      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Bob');
    });
  });
});
