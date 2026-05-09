import forge from 'node-forge';
import CryptoJS from 'crypto-js';

export const decryptPrivateKey = (encryptedKey: string, secret: string): string => {
  const decrypted = CryptoJS.AES.decrypt(encryptedKey, secret);
  return decrypted.toString(CryptoJS.enc.Utf8);
};

export const decryptWithPrivateKey = (encryptedData: string, privateKeyPem: string): string => {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const encrypted = forge.util.decode64(encryptedData);
  const decrypted = privateKey.decrypt(encrypted, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha1.create()
    }
  });
  return decrypted;
};

export const decryptMessage = (encryptedData: { iv: string; cipherText: string }, aesKey: string): string => {
  const { iv, cipherText } = encryptedData;

  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.enc.Base64.parse(cipherText) } as any,
    CryptoJS.enc.Hex.parse(aesKey),
    {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  );

  return decrypted.toString(CryptoJS.enc.Utf8);
};

export const encryptWithPublicKey = (data: string, publicKeyPem: string): string => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encrypted = publicKey.encrypt(data, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha1.create()
    }
  });
  return forge.util.encode64(encrypted);
};

export const encryptMessage = (message: string, aesKey: string): { iv: string; cipherText: string } => {
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

export const generateAESKey = (): string => {
  const randomBytes = CryptoJS.lib.WordArray.random(32);
  return CryptoJS.enc.Hex.stringify(randomBytes);
};
