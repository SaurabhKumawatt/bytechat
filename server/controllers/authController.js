import User from '../models/User.js';
import { generateRSAKeys, encryptPrivateKey } from '../utils/crypto/rsa.js';
import jwt from 'jsonwebtoken';

export const verifyOTPAndRegister = async (req, res) => {
  try {
    const { phone, name, otp } = req.body;

    if (!phone || !name || !otp) {
      return res.status(400).json({
        error: 'Phone, name, and OTP are required'
      });
    }

    const validOTP = '123456';
    if (otp !== validOTP) {
      return res.status(401).json({
        error: 'Invalid OTP'
      });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      const { publicKey, privateKey } = generateRSAKeys();

      const encryptedPrivateKey = encryptPrivateKey(
        privateKey,
        process.env.RSA_SECRET
      );

      user = new User({
        phone,
        name,
        publicKey,
        privateKey: encryptedPrivateKey,
        verified: true,
        online: true
      });

      await user.save();

      const token = jwt.sign(
        { userId: user._id, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.status(201).json({
        message: 'User registered successfully with RSA keys',
        token,
        user: {
          id: user._id,
          phone: user.phone,
          name: user.name,
          publicKey: user.publicKey,
          privateKey: user.privateKey,
          verified: user.verified
        }
      });
    } else {
      user.verified = true;
      user.online = true;
      await user.save();

      const token = jwt.sign(
        { userId: user._id, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.status(200).json({
        message: 'User verified successfully',
        token,
        user: {
          id: user._id,
          phone: user.phone,
          name: user.name,
          publicKey: user.publicKey,
          privateKey: user.privateKey,
          verified: user.verified
        }
      });
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({
      error: 'Server error during OTP verification'
    });
  }
};

export const requestOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const otp = '123456';

    console.log(`📱 OTP for ${phone}: ${otp}`);

    return res.status(200).json({
      message: 'OTP sent successfully',
      otp
    });
  } catch (error) {
    console.error('OTP request error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getUserPublicKey = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('publicKey phone name');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      userId: user._id,
      phone: user.phone,
      name: user.name,
      publicKey: user.publicKey
    });
  } catch (error) {
    console.error('Get public key error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
