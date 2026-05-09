import { generateRSAKeys, encryptPrivateKey, decryptPrivateKey, encryptWithPublicKey, decryptWithPrivateKey } from '../utils/crypto/rsa.js';
import { generateAESKey, encryptMessage, decryptMessage, encryptMessageSimple, decryptMessageSimple } from '../utils/crypto/aes.js';

describe('Encryption Layer', () => {
  describe('RSA Key Generation', () => {
    test('should generate valid RSA keys', () => {
      const { publicKey, privateKey } = generateRSAKeys();

      expect(publicKey).toBeDefined();
      expect(privateKey).toBeDefined();
      expect(publicKey).toContain('BEGIN PUBLIC KEY');
      expect(privateKey).toContain('BEGIN RSA PRIVATE KEY');
    });

    test('should encrypt and decrypt private key with AES', () => {
      const { privateKey } = generateRSAKeys();
      const secret = 'test-secret-key';

      const encrypted = encryptPrivateKey(privateKey, secret);
      const decrypted = decryptPrivateKey(encrypted, secret);

      expect(encrypted).not.toBe(privateKey);
      expect(decrypted).toBe(privateKey);
    });

    test('should encrypt data with public key and decrypt with private key', () => {
      const { publicKey, privateKey } = generateRSAKeys();
      const testData = 'Hello ByteChat';

      const encrypted = encryptWithPublicKey(testData, publicKey);
      const decrypted = decryptWithPrivateKey(encrypted, privateKey);

      expect(encrypted).not.toBe(testData);
      expect(decrypted).toBe(testData);
    });
  });

  describe('AES Encryption', () => {
    test('should generate a valid AES key', () => {
      const key = generateAESKey();

      expect(key).toBeDefined();
      expect(key.length).toBe(64);
    });

    test('should encrypt and decrypt message correctly', () => {
      const key = generateAESKey();
      const msg = 'ByteChat Test Message';

      const encrypted = encryptMessage(msg, key);
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.cipherText).toBeDefined();

      const decrypted = decryptMessage(encrypted, key);
      expect(decrypted).toBe(msg);
    });

    test('should encrypt and decrypt using simple method', () => {
      const key = 'test-aes-key';
      const msg = 'Simple encryption test';

      const encrypted = encryptMessageSimple(msg, key);
      const decrypted = decryptMessageSimple(encrypted, key);

      expect(encrypted).not.toBe(msg);
      expect(decrypted).toBe(msg);
    });

    test('should produce different ciphertext for same message (due to random IV)', () => {
      const key = generateAESKey();
      const msg = 'Same message';

      const encrypted1 = encryptMessage(msg, key);
      const encrypted2 = encryptMessage(msg, key);

      expect(encrypted1.cipherText).not.toBe(encrypted2.cipherText);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });
  });

  describe('End-to-End Encryption Flow', () => {
    test('should simulate full message encryption flow', () => {
      const sender = generateRSAKeys();
      const receiver = generateRSAKeys();

      const message = 'Hello from sender to receiver';
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
  });
});
