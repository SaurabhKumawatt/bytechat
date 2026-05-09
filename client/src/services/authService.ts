import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface User {
  id: string;
  phone: string;
  name?: string;
  verified: boolean;
  publicKey?: string;
  privateKey?: string;
}

export const sendOTP = async (phone: string, name?: string): Promise<{ success: boolean; message: string; otp?: string }> => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/request-otp`, { phone });

    return {
      success: true,
      message: response.data.message || 'OTP sent successfully',
      otp: response.data.otp
    };
  } catch (error: any) {
    const message = error.response?.data?.error || 'Failed to send OTP';
    return { success: false, message };
  }
};

export const verifyOTP = async (
  phone: string,
  otp: string,
  name?: string
): Promise<{ success: boolean; message: string; token?: string; user?: User }> => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
      phone,
      otp,
      name: name || 'User'
    });

    return {
      success: true,
      message: response.data.message || 'Verification successful',
      token: response.data.token,
      user: response.data.user
    };
  } catch (error: any) {
    const message = error.response?.data?.error || 'Verification failed';
    return { success: false, message };
  }
};
