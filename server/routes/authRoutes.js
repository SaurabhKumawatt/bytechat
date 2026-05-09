import express from 'express';
import { requestOTP, verifyOTPAndRegister, getUserPublicKey } from '../controllers/authController.js';

const router = express.Router();

router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTPAndRegister);
router.get('/user/:userId/publickey', getUserPublicKey);

export default router;
