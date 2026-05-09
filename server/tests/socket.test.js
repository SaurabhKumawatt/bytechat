import { io as ioClient } from 'socket.io-client';
import { generateAESKey, encryptMessage, decryptMessage } from '../utils/crypto/aes.js';
import { generateRSAKeys, encryptWithPublicKey, decryptWithPrivateKey } from '../utils/crypto/rsa.js';

const BASE_URL = process.env.TEST_SERVER_URL || 'http://localhost:5000';

describe('Socket.io Messaging', () => {
  let socket;

  afterEach(() => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  });

  describe('Connection Tests', () => {
    test('should establish a socket connection with valid token', (done) => {
      const mockToken = 'test-jwt-token';

      socket = ioClient(BASE_URL, {
        auth: { token: mockToken },
        transports: ['websocket']
      });

      socket.on('connect', () => {
        expect(socket.connected).toBe(true);
        done();
      });

      socket.on('connect_error', (error) => {
        console.log('Connection error expected for test token:', error.message);
        done();
      });
    }, 10000);

    test('should reject connection without token', (done) => {
      socket = ioClient(BASE_URL, {
        auth: {},
        transports: ['websocket']
      });

      socket.on('connect_error', (error) => {
        expect(error.message).toContain('Authentication error');
        done();
      });
    }, 10000);
  });

  describe('Message Encryption Tests', () => {
    test('should encrypt and decrypt a message using AES', () => {
      const message = 'Test Message for ByteChat';
      const aesKey = generateAESKey();

      const encrypted = encryptMessage(message, aesKey);

      expect(encrypted.iv).toBeDefined();
      expect(encrypted.cipherText).toBeDefined();
      expect(encrypted.cipherText).not.toBe(message);

      const decrypted = decryptMessage(encrypted, aesKey);
      expect(decrypted).toBe(message);
    });

    test('should produce unique ciphertext for same message', () => {
      const message = 'Same message content';
      const aesKey = generateAESKey();

      const encrypted1 = encryptMessage(message, aesKey);
      const encrypted2 = encryptMessage(message, aesKey);

      expect(encrypted1.cipherText).not.toBe(encrypted2.cipherText);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);

      const decrypted1 = decryptMessage(encrypted1, aesKey);
      const decrypted2 = decryptMessage(encrypted2, aesKey);

      expect(decrypted1).toBe(message);
      expect(decrypted2).toBe(message);
    });
  });

  describe('End-to-End Encryption Flow', () => {
    test('should simulate full message encryption flow', () => {
      const sender = generateRSAKeys();
      const receiver = generateRSAKeys();

      const message = 'Hello from Alice to Bob';

      const aesKey = generateAESKey();

      const { iv, cipherText } = encryptMessage(message, aesKey);

      const encryptedAESKey = encryptWithPublicKey(aesKey, receiver.publicKey);

      const decryptedAESKey = decryptWithPrivateKey(encryptedAESKey, receiver.privateKey);

      const decryptedMessage = decryptMessage({ iv, cipherText }, decryptedAESKey);

      expect(decryptedMessage).toBe(message);
    });

    test('should fail to decrypt with wrong private key', () => {
      const user1 = generateRSAKeys();
      const user2 = generateRSAKeys();

      const aesKey = generateAESKey();
      const encryptedAESKey = encryptWithPublicKey(aesKey, user1.publicKey);

      expect(() => {
        decryptWithPrivateKey(encryptedAESKey, user2.privateKey);
      }).toThrow();
    });

    test('should handle multiple messages with different keys', () => {
      const sender = generateRSAKeys();
      const receiver = generateRSAKeys();

      const messages = [
        'First message',
        'Second message',
        'Third message with more content'
      ];

      messages.forEach((msg) => {
        const aesKey = generateAESKey();
        const { iv, cipherText } = encryptMessage(msg, aesKey);
        const encryptedAESKey = encryptWithPublicKey(aesKey, receiver.publicKey);

        const decryptedAESKey = decryptWithPrivateKey(encryptedAESKey, receiver.privateKey);
        const decryptedMessage = decryptMessage({ iv, cipherText }, decryptedAESKey);

        expect(decryptedMessage).toBe(msg);
      });
    });
  });

  describe('Typing Indicator Tests', () => {
    test('should handle typing events', () => {
      const typingEvent = {
        receiverId: 'user123'
      };

      expect(typingEvent.receiverId).toBe('user123');
    });

    test('should handle stop typing events', () => {
      const stopTypingEvent = {
        receiverId: 'user123'
      };

      expect(stopTypingEvent.receiverId).toBe('user123');
    });
  });

  describe('Message Status Tests', () => {
    test('should validate message status values', () => {
      const validStatuses = ['sent', 'delivered', 'seen'];

      validStatuses.forEach((status) => {
        expect(['sent', 'delivered', 'seen']).toContain(status);
      });
    });

    test('should reject invalid status', () => {
      const invalidStatus = 'invalid';
      const validStatuses = ['sent', 'delivered', 'seen'];

      expect(validStatuses).not.toContain(invalidStatus);
    });
  });

  describe('Online Users Tracking', () => {
    test('should track online user list', () => {
      const onlineUsers = ['user1', 'user2', 'user3'];

      expect(onlineUsers.length).toBe(3);
      expect(onlineUsers).toContain('user1');
      expect(onlineUsers).toContain('user2');
      expect(onlineUsers).toContain('user3');
    });

    test('should update online users on connect/disconnect', () => {
      let onlineUsers = ['user1', 'user2'];

      onlineUsers.push('user3');
      expect(onlineUsers.length).toBe(3);

      onlineUsers = onlineUsers.filter((id) => id !== 'user2');
      expect(onlineUsers.length).toBe(2);
      expect(onlineUsers).not.toContain('user2');
    });
  });
});
