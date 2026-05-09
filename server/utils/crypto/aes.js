import CryptoJS from 'crypto-js';
import crypto from 'crypto';

export const generateAESKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const encryptMessage = (message, aesKey) => {
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(message, CryptoJS.enc.Hex.parse(aesKey), {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  const ivHex = CryptoJS.enc.Hex.stringify(iv);
  const cipherText = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

  return {
    iv: ivHex,
    cipherText: cipherText
  };
};

export const decryptMessage = (encryptedData, aesKey) => {
  const { iv, cipherText } = encryptedData;

  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.enc.Base64.parse(cipherText) },
    CryptoJS.enc.Hex.parse(aesKey),
    {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  );

  return decrypted.toString(CryptoJS.enc.Utf8);
};

export const encryptMessageSimple = (message, aesKey) => {
  const encrypted = CryptoJS.AES.encrypt(message, aesKey).toString();
  return encrypted;
};

export const decryptMessageSimple = (encryptedMessage, aesKey) => {
  const decrypted = CryptoJS.AES.decrypt(encryptedMessage, aesKey);
  return decrypted.toString(CryptoJS.enc.Utf8);
};
