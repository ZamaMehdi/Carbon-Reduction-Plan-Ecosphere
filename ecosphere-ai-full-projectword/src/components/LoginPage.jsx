import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';


const LoginPage = ({ onLoginSuccess, onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetShowPassword, setResetShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/login', { email, password });

      const { data: me } = await api.get('/auth/me');
      const user = {
        id: me.userId,
        email: me.email,
      };
  
      // ✅ Fetch latest report *before* navigating
      let latestReport = null;
      try {
        const { data: reportData } = await api.get('/reports/latest-report');
        latestReport = reportData;
      } catch (reportErr) {
        console.warn('No latest report found or failed to fetch it');
      }
  
      // ✅ Pass both user & report to parent
      onLoginSuccess(user, latestReport);
  
      // ✅ Navigate only after data setup
      if (user.email.toLowerCase() === 'admin@example.com') {
        navigate('/admin');
      } else {
        navigate('/');
      }
  
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login.');
    }
  };
  

  // Forgot password handlers
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResetError('');
    setResetSuccess('');
    try {
      await api.post('/auth/forgot-password', { email: resetEmail });
      setForgotStep(2);
      setResetSuccess('A 6-digit code has been sent to your email.');
    } catch (err) {
      setResetError(err.response?.data?.message || 'Error sending reset code.');
    }
    setIsLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResetError('');
    setResetSuccess('');
    try {
      await api.post('/auth/verify-reset-code', { email: resetEmail, code: resetCode });
      setForgotStep(3);
      setResetSuccess('Code verified. Please enter your new password.');
    } catch (err) {
      setResetError(err.response?.data?.message || 'Invalid or expired code.');
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResetError('');
    setResetSuccess('');
    if (resetPassword !== resetConfirm) {
      setResetError('Passwords do not match.');
      setIsLoading(false);
      return;
    }
    try {
      await api.post('/auth/reset-password', { email: resetEmail, code: resetCode, newPassword: resetPassword });
      setResetSuccess('Password reset successful! You can now log in.');
      setForgotStep(1);
      setShowForgot(false);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Error resetting password.');
    }
    setIsLoading(false);
  };

  // Resend code handler
  const handleResendCode = async () => {
    setResendLoading(true);
    setResetError('');
    setResetSuccess('');
    try {
      await api.post('/auth/forgot-password', { email: resetEmail });
      setResetSuccess('A new 6-digit code has been sent to your email.');
      setResendTimer(30);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Error resending code.');
    }
    setResendLoading(false);
  };

  // Countdown effect for resend button
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  return (
<div
  className="flex items-center justify-center min-h-screen bg-center bg-contain"
  style={{ backgroundImage: "url('/BGecosphere.jpg')",
    backgroundColor: "#f3f4f6", 
   }}
>
<div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
  <div className="flex items-center justify-center mb-6">
    <img
      src="/logo.png"
      alt="EcoSphere Logo"
      className="mr-5"
      style={{ width: '80px', height: '80px' }}
    />
    <h2 className="text-2xl font-bold text-gray-900">Login to CRP</h2>
  </div>

        {!showForgot ? (
          <>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="form-label">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" />
              </div>
              <div>
                <label className="form-label">Password</label>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="form-input" 
                />
                <div className="mt-2 flex items-center">
                  <input 
                    id="show-password" 
                    type="checkbox" 
                    checked={showPassword} 
                    onChange={() => setShowPassword(v => !v)} 
                    className="mr-2"
                  />
                  <label htmlFor="show-password" className="text-sm text-gray-700 select-none">Show password</label>
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" className="btn-primary w-full">Login</button>
            </form>
            <div className="flex justify-between items-center mt-4">
              <button type="button" className="text-sm text-green-600 hover:underline" onClick={onNavigateToSignup}>Sign Up</button>
              <button type="button" className="text-sm text-blue-600 hover:underline" onClick={() => { setShowForgot(true); setForgotStep(1); setResetError(''); setResetSuccess(''); }}>Forgot password?</button>
            </div>
          </>
        ) : (
          <div>
            {forgotStep === 1 && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <label className="form-label">Enter your registered email address</label>
                <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required className="form-input" />
                <button type="submit" className="btn-primary w-full" disabled={isLoading}>{isLoading ? 'Sending...' : 'Send Code'}</button>
                <button type="button" className="text-sm text-gray-600 hover:underline mt-2" onClick={() => setShowForgot(false)}>Back to login</button>
              </form>
            )}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <label className="form-label">Enter the 6-digit code sent to your email</label>
                <input type="text" value={resetCode} onChange={e => setResetCode(e.target.value)} required className="form-input" maxLength={6} />
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleResendCode}
                    disabled={resendTimer > 0 || resendLoading}
                  >
                    {resendLoading ? 'Resending...' : 'Resend'}
                  </button>
                  {resendTimer > 0 && (
                    <span className="text-xs text-gray-500">{resendTimer}s</span>
                  )}
                </div>
                <button type="submit" className="btn-primary w-full" disabled={isLoading}>{isLoading ? 'Verifying...' : 'Verify Code'}</button>
                <button type="button" className="text-sm text-gray-600 hover:underline mt-2" onClick={() => setForgotStep(1)}>Back</button>
              </form>
            )}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <label className="form-label">Enter your new password</label>
                <input type={resetShowPassword ? 'text' : 'password'} value={resetPassword} onChange={e => setResetPassword(e.target.value)} required className="form-input" />
                <label className="form-label">Confirm new password</label>
                <input type={resetShowPassword ? 'text' : 'password'} value={resetConfirm} onChange={e => setResetConfirm(e.target.value)} required className="form-input" />
                <div className="mt-2 flex items-center">
                  <input 
                    id="show-reset-password" 
                    type="checkbox" 
                    checked={resetShowPassword} 
                    onChange={() => setResetShowPassword(v => !v)} 
                    className="mr-2"
                  />
                  <label htmlFor="show-reset-password" className="text-sm text-gray-700 select-none">Show password</label>
                </div>
                <button type="submit" className="btn-primary w-full" disabled={isLoading}>{isLoading ? 'Resetting...' : 'Reset Password'}</button>
                <button type="button" className="text-sm text-gray-600 hover:underline mt-2" onClick={() => setForgotStep(1)}>Back</button>
              </form>
            )}
            {resetError && <p className="text-sm text-red-600 mt-2">{resetError}</p>}
            {resetSuccess && <p className="text-sm text-green-600 mt-2">{resetSuccess}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage; 