# ByteChat Server - RSA & AES Encryption Layer

## Overview

ByteChat backend server implementing **RSA-2048** for key exchange and **AES-256-CBC** for message encryption.

## Architecture

### Encryption Flow

1. **User Registration**
   - Upon OTP verification, RSA-2048 key pair is generated
   - Public key stored in plaintext
   - Private key encrypted with AES before database storage

2. **Message Encryption**
   - Sender generates random AES-256 key
   - Message encrypted with AES-256-CBC (unique IV per message)
   - AES key encrypted with recipient's RSA public key
   - Both encrypted message and encrypted AES key stored in database

3. **Message Decryption**
   - Recipient decrypts AES key using their RSA private key
   - Message decrypted using recovered AES key and stored IV

## Directory Structure

```
server/
├── controllers/
│   ├── authController.js      # OTP verification, RSA key generation
│   └── messageController.js   # Message encryption/decryption
├── models/
│   ├── User.js                # User schema with encryption keys
│   └── Message.js             # Message schema with encrypted data
├── routes/
│   ├── authRoutes.js          # Authentication endpoints
│   └── messageRoutes.js       # Messaging endpoints
├── utils/
│   └── crypto/
│       ├── rsa.js             # RSA key generation & operations
│       └── aes.js             # AES-256 encryption utilities
├── tests/
│   └── encryption.test.js     # Comprehensive encryption tests
├── .env                       # Environment variables
├── index.js                   # Express server entry point
└── package.json
```

## API Endpoints

### Authentication

**POST** `/api/auth/request-otp`
```json
{
  "phone": "+1234567890"
}
```

**POST** `/api/auth/verify-otp`
```json
{
  "phone": "+1234567890",
  "name": "John Doe",
  "otp": "123456"
}
```
Response includes JWT token and user public key.

**GET** `/api/auth/user/:userId/publickey`

Returns user's public key for encryption.

### Messages

**POST** `/api/messages/send`
```json
{
  "senderId": "user_id_1",
  "receiverId": "user_id_2",
  "message": "Hello!"
}
```

**GET** `/api/messages/:userId/:contactId`

Retrieves all encrypted messages between two users.

**PATCH** `/api/messages/:messageId/read`

Marks message as read.

## Security Features

- **RSA-2048** key pairs generated per user
- **AES-256-CBC** encryption with unique IV per message
- Private keys encrypted at rest using AES
- No plaintext messages stored in database
- Environment-based secrets management

## Database Schema

### User Model
```javascript
{
  phone: String,           // Unique phone number
  name: String,            // Display name
  publicKey: String,       // RSA public key (PEM format)
  privateKey: String,      // AES-encrypted RSA private key
  verified: Boolean,
  online: Boolean,
  lastSeen: Date
}
```

### Message Model
```javascript
{
  senderId: String,        // Sender user ID
  receiverId: String,      // Receiver user ID
  encryptedMessage: String,// AES-encrypted message
  encryptedAESKey: String, // RSA-encrypted AES key
  iv: String,              // Initialization vector
  timestamp: Date,
  delivered: Boolean,
  read: Boolean
}
```

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bytechat
RSA_SECRET=your-rsa-private-key-encryption-secret
AES_SECRET=your-aes-encryption-secret
JWT_SECRET=your-jwt-secret
NODE_ENV=development
```

## Installation

```bash
cd server
npm install
```

## Running the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## Running Tests

```bash
npm test
```

All 9 encryption tests passing:
- RSA key generation validation
- Private key encryption/decryption
- RSA encrypt/decrypt operations
- AES key generation
- AES message encryption with IV
- End-to-end encryption flow
- Security validation (wrong key rejection)

## Test Results

```
✓ should generate valid RSA keys
✓ should encrypt and decrypt private key with AES
✓ should encrypt data with public key and decrypt with private key
✓ should generate a valid AES key
✓ should encrypt and decrypt message correctly
✓ should encrypt and decrypt using simple method
✓ should produce different ciphertext for same message (due to random IV)
✓ should simulate full message encryption flow
✓ should fail to decrypt with wrong private key

Test Suites: 1 passed
Tests: 9 passed
```

## Security Checklist

- [x] RSA 2048-bit keys generated per user
- [x] Private key encrypted before DB save
- [x] AES-256-CBC used for all message encryption
- [x] Unique IV generated per message
- [x] No plaintext data in any collection
- [x] Environment secrets loaded from `.env`
- [x] All encryption operations tested and validated

## Example Usage Flow

### 1. User Registration
```javascript
// OTP verification triggers RSA key generation
POST /api/auth/verify-otp
→ RSA keys generated
→ Private key encrypted with RSA_SECRET
→ Keys stored in database
→ JWT token returned
```

### 2. Sending Encrypted Message
```javascript
POST /api/messages/send
{
  "senderId": "alice_id",
  "receiverId": "bob_id",
  "message": "Hello Bob!"
}

→ Generate AES-256 key
→ Encrypt message with AES key + random IV
→ Fetch Bob's public key
→ Encrypt AES key with Bob's RSA public key
→ Store: encryptedMessage, encryptedAESKey, iv
```

### 3. Receiving & Decrypting Message
```javascript
GET /api/messages/alice_id/bob_id

→ Retrieve encrypted messages
→ Client decrypts AES key using Bob's private key
→ Client decrypts message using AES key + IV
→ Display plaintext message
```

## Next Steps

- **Prompt 4**: Socket.io Real-Time Chat Integration
- Add WebSocket support for live messaging
- Implement online presence system
- Add typing indicators
- Build message delivery confirmations

## Dependencies

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `node-forge` - RSA cryptography
- `crypto-js` - AES encryption
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment configuration
- `cors` - Cross-origin support

## Production Considerations

1. **Key Storage**: Consider using hardware security modules (HSM) for private key encryption in production
2. **Key Rotation**: Implement periodic RSA key rotation mechanism
3. **Rate Limiting**: Add request throttling for API endpoints
4. **MongoDB Atlas**: Use managed MongoDB service with encryption at rest
5. **HTTPS**: Ensure all traffic uses TLS/SSL encryption
6. **Secrets Management**: Use AWS Secrets Manager or HashiCorp Vault in production
