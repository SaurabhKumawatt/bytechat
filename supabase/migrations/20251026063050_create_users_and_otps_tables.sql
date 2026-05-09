/*
  # ByteChat Database Schema - Users and OTPs

  ## Overview
  Creates the foundational tables for ByteChat's OTP authentication system with RSA key management.

  ## 1. New Tables
  
  ### `users` table
  - `id` (uuid, primary key) - Unique user identifier
  - `phone` (text, unique, not null) - User's phone number (10 digits)
  - `name` (text) - User's display name
  - `public_key` (text) - RSA-2048 public key for message encryption
  - `online` (boolean, default false) - Current online status
  - `last_seen` (timestamptz) - Last activity timestamp
  - `verified` (boolean, default false) - Phone verification status
  - `created_at` (timestamptz, default now()) - Account creation timestamp
  - `updated_at` (timestamptz, default now()) - Last update timestamp

  ### `otps` table
  - `id` (uuid, primary key) - Unique OTP entry identifier
  - `phone` (text, not null) - Target phone number
  - `code_hash` (text, not null) - SHA-256 hashed OTP code
  - `expires_at` (timestamptz, not null) - OTP expiration timestamp (2 minutes)
  - `attempts` (integer, default 0) - Failed verification attempts
  - `created_at` (timestamptz, default now()) - OTP generation timestamp

  ## 2. Security Features
  
  - **Row Level Security (RLS)** enabled on all tables
  - OTP codes are SHA-256 hashed before storage (never plaintext)
  - Phone number uniqueness constraint prevents duplicate accounts
  - Rate limiting tracked via attempts column (max 3 attempts)
  - Automatic expiry enforcement via expires_at timestamp

  ## 3. RLS Policies

  ### Users Table Policies
  1. **Users can read all user profiles** - Required for contact discovery and online status
  2. **Users can update their own profile** - Name, online status, public_key
  3. **Users can insert their own profile** - Registration flow

  ### OTPs Table Policies
  1. **Service role full access** - Backend-only table management
  2. **No public access** - OTPs are sensitive and backend-managed only

  ## 4. Performance Optimizations
  
  - Index on `users.phone` for fast lookup during authentication
  - Index on `otps.phone` and `otps.expires_at` for efficient OTP validation
  - Automatic cleanup of expired OTPs via backend cron job

  ## 5. Important Notes
  
  - Private RSA keys are NEVER stored in the database
  - OTP entries should be deleted immediately after successful verification
  - Online status is managed via Socket.io events
  - Phone numbers must be validated (10 digits, India format) before insertion
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL CHECK (phone ~ '^\d{10}$'),
  name text DEFAULT '',
  public_key text,
  online boolean DEFAULT false,
  last_seen timestamptz DEFAULT now(),
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create otps table
CREATE TABLE IF NOT EXISTS otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL CHECK (phone ~ '^\d{10}$'),
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read all profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role has full access to users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- OTPs table policies (backend-only access)
CREATE POLICY "Service role has full access to otps"
  ON otps
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_online ON users(online);
CREATE INDEX IF NOT EXISTS idx_otps_phone_expires ON otps(phone, expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();