# Environment Variables Setup

This document explains how to configure environment variables for ByteChat's OTP authentication system.

## Required Environment Variables

### 1. Supabase Configuration

Already configured in this project:

```env
VITE_SUPABASE_URL=https://zilqylrzgitjndglryek.supabase.co
VITE_SUPABASE_ANON_KEY=[your_anon_key]
```

### 2. Fast2SMS API Key

Required for sending OTP SMS messages.

**Steps to obtain:**

1. Visit [Fast2SMS Dashboard](https://www.fast2sms.com/dashboard)
2. Sign up or log in to your account
3. Navigate to **Dev API** section
4. Copy your API key
5. Add to `.env` file:

```env
VITE_FAST2SMS_API_KEY=your_actual_api_key_here
```

**Note:** Without this key, OTP will be logged to console instead of sent via SMS (development mode).

### 3. JWT Secret

Used for generating authentication tokens.

```env
VITE_JWT_SECRET=bytechat_jwt_secret_change_in_production_2024
```

**Production:** Change to a strong random string (minimum 32 characters).

## Security Best Practices

- **NEVER** commit `.env` file to version control
- Use `.env.example` as a template for team members
- Rotate JWT secret regularly in production
- Keep Fast2SMS API key confidential
- Use environment-specific `.env` files for staging/production

## Testing Without Fast2SMS

For local development without Fast2SMS:

1. Leave `VITE_FAST2SMS_API_KEY` empty or comment it out
2. OTP will be logged to browser console
3. Check console for the 6-digit code during testing

## Verifying Configuration

Run this command to check if all variables are loaded:

```bash
npm run dev
```

Check browser console for any missing variable warnings.
