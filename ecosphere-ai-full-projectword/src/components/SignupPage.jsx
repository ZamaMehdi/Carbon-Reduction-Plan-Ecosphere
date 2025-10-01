import React, { useState } from 'react';
import api from '../api/axiosConfig';

const SignupPage = ({ onSignupSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/signup', { email, password });
      setMessage('Account created successfully!');
      setTimeout(() => onSignupSuccess(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
    setLoading(false);
  };

  return (
    <div
   className="flex items-center justify-center min-h-screen bg-center bg-contain"
   style={{ backgroundImage: "url('/BGecosphere.jpg')",
    backgroundColor: "#f3f4f6", 
    }}
    >
    <div className="flex items-center justify-center min-h-screen">
      <div 
        className="signup-form-container p-6 space-y-4 bg-white rounded-lg shadow-md"
        style={{ 
          width: '473px', 
          maxWidth: '473px', 
          minWidth: '473px',
          boxSizing: 'border-box'
        }}
      >
        {/* Force refresh - width should match login */}
        <div className="text-center">
          <img
            src="/logo.png"
            alt="CRP Logo"
            className="mx-auto mb-3"
            style={{ width: '50px', height: '50px' }}
          />
          <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
          <p className="text-gray-600 mt-1 text-sm">Join Carbon Reduction Planning</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Enter your email address"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Create Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Create a strong password"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Confirm your password"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="show-password"
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword((v) => !v)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="show-password" className="text-sm text-gray-600 select-none">
              Show password
            </label>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <p className="text-sm text-green-600 text-center">{message}</p>
          </div>
        )}
        
        <div className="text-center pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={onSignupSuccess} 
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default SignupPage;
