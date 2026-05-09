# ByteChat - Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB running (local or cloud)
- Two terminal windows

## Step 1: Clone and Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

## Step 2: Configure Environment

### Frontend `.env` (root directory)
```env
VITE_API_URL=http://localhost:5000
VITE_RSA_SECRET=bytechat-rsa-encryption-secret-key-2024
```

### Backend `server/.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bytechat
JWT_SECRET=bytechat-jwt-secret-change-this
RSA_SECRET=bytechat-rsa-encryption-secret-key-2024
CLIENT_URL=http://localhost:5173
```

## Step 3: Start Backend Server

```bash
cd server
npm start
```

You should see:
```
✅ MongoDB connected successfully
🚀 ByteChat server running on port 5000
🔌 Socket.io initialized
```

## Step 4: Start Frontend (New Terminal)

```bash
npm run dev
```

You should see:
```
VITE v5.4.8  ready in X ms

➜  Local:   http://localhost:5173/
```

## Step 5: Open Application

1. Open browser to `http://localhost:5173`
2. You should see the ByteChat login page
3. Enter a 10-digit phone number
4. Click "Send OTP"
5. Use OTP: `123456` (hardcoded for development)
6. Click "Verify & Continue"
7. You're in! 🎉

## Testing with Two Users

### Browser 1 (User A):
1. Phone: `1111111111`
2. OTP: `123456`
3. Name: Alice

### Browser 2 (User B - Incognito):
1. Phone: `2222222222`
2. OTP: `123456`
3. Name: Bob

Now Alice and Bob can chat with each other in real-time with end-to-end encryption!

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongosh`
- Verify `.env` file exists in `server/` directory

### Frontend shows blank page
- Check browser console (F12) for errors
- Verify backend is running on port 5000
- Check `.env` file exists in root directory

### Can't send messages
- Check Socket.io connected (console should show "Socket connected")
- Verify both users are logged in
- Check backend logs for errors

## What's Working

✅ OTP Authentication
✅ User Registration
✅ Real-time Messaging
✅ End-to-end Encryption (RSA + AES)
✅ Online/Offline Status
✅ Typing Indicators
✅ Message Status (Sent/Delivered/Seen)
✅ Contact List
✅ Message History

## Development Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm test             # Run tests

# Backend
cd server
npm start            # Start server
npm test             # Run tests
```

## Production Build

```bash
# Build frontend
npm run build

# Output in dist/ directory
# Deploy to Vercel, Netlify, etc.

# Backend runs directly
cd server
npm start
# Deploy to Railway, Render, AWS, etc.
```

## Need Help?

- Check `BUGFIXES.md` for detailed troubleshooting
- Check `FRONTEND_IMPLEMENTATION.md` for frontend details
- Check `server/SOCKET_IMPLEMENTATION.md` for real-time features
- Check `server/PRESENCE_TRACKING.md` for online status

## Next Steps

1. ✅ Basic functionality working
2. 🚀 Add real SMS provider (replace mock OTP)
3. 🚀 Deploy to production
4. 🚀 Add group chat feature
5. 🚀 Add file/image sharing
6. 🚀 Add voice/video calls

Happy chatting! 💬🔒
