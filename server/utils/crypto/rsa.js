import forge from 'node-forge';
import CryptoJS from 'crypto-js';

export const generateRSAKeys = () => {
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });

  const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
  const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);

  return {
    publicKey,
    privateKey
  };
};

export const encryptPrivateKey = (privateKey, secret) => {
  const encrypted = CryptoJS.AES.encrypt(privateKey, secret).toString();
  return encrypted;
};

export const decryptPrivateKey = (encryptedKey, secret) => {
  const decrypted = CryptoJS.AES.decrypt(encryptedKey, secret);
  return decrypted.toString(CryptoJS.enc.Utf8);
};

export const encryptWithPublicKey = (data, publicKeyPem) => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encrypted = publicKey.encrypt(data, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha1.create()
    }
  });
  return forge.util.encode64(encrypted);
};

export const decryptWithPrivateKey = (encryptedData, privateKeyPem) => {
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
