import React, { useState } from 'react';
import { getBackendUrl } from '../utils/urlUtils';
import { useNavigate } from 'react-router-dom';

const VerifyPhone = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState('submitPhone'); // 'submitPhone' | 'verifyOtp'
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const backendUrl = getBackendUrl();

  const handleSubmitPhone = async () => {
    setError('');
    try {
      const res = await fetch(`${backendUrl}/api/auth/submit-phone`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send OTP');
      }

      setStage('verifyOtp');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    try {
      const res = await fetch(`${backendUrl}/api/auth/verify-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'OTP verification failed');
      }

      navigate('/workflows');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Verify Your Phone</h2>
      {stage === 'submitPhone' && (
        <>
          <input
            type="tel"
            value={phoneNumber}
            placeholder="Enter phone number"
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
          />
          <button onClick={handleSubmitPhone} className="w-full bg-blue-600 text-white py-2 rounded">
            Send OTP
          </button>
        </>
      )}

      {stage === 'verifyOtp' && (
        <>
          <input
            type="text"
            value={otp}
            placeholder="Enter OTP"
            onChange={(e) => setOtp(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
          />
          <button onClick={handleVerifyOtp} className="w-full bg-green-600 text-white py-2 rounded">
            Verify OTP
          </button>
        </>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default VerifyPhone;
