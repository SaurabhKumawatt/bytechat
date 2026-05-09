import { useState } from 'react';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { OTPInput } from '../components/OTPInput';
import { sendOTP, verifyOTP } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendOTP = async () => {
    setError('');
    setMessage('');

    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    const result = await sendOTP(phone, name);
    setLoading(false);

    if (result.success) {
      setMessage(result.message);
      setStep('otp');
    } else {
      setError(result.message);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    setMessage('');

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    const result = await verifyOTP(phone, otp, name || undefined);
    setLoading(false);

    if (result.success && result.token && result.user) {
      setMessage('Login successful!');
      login(result.token, result.user);
    } else {
      setError(result.message);
      setOtp('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0F172A] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#1E3A8A] to-[#38BDF8] rounded-2xl mb-4 shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            ByteChat
          </h1>
          <p className="text-gray-300 text-sm">Secure encrypted messaging</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {step === 'phone' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Welcome
                </h2>
                <p className="text-gray-600 text-sm">Enter your phone number to get started</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name (Optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit phone number"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
              )}

              {message && (
                <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg">{message}</div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading || phone.length !== 10}
                className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#38BDF8] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Verify OTP
                </h2>
                <p className="text-gray-600 text-sm">Enter the 6-digit code sent to your phone</p>
              </div>

              <OTPInput length={6} value={otp} onChange={setOtp} disabled={loading} />

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
              )}

              {message && (
                <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg">{message}</div>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#38BDF8] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError('');
                  setMessage('');
                }}
                className="w-full text-gray-600 text-sm hover:text-gray-800 transition-colors"
              >
                Change phone number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
