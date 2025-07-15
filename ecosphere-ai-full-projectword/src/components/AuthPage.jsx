import React, { useState } from 'react';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';

const AuthPage = ({ onAuthSuccess }) => {
  const [showLogin, setShowLogin] = useState(true);

  const handleNavigation = () => {
    setShowLogin(!showLogin);
  }

  const handleLoginSuccess = (user, report) => {
    onAuthSuccess(user, report); // ✅ now supports two args
  };

  if (showLogin) {
    return <LoginPage 
    onLoginSuccess={onAuthSuccess} 
    onNavigateToSignup={handleNavigation} 
    />;
  } else {
    return <SignupPage onSignupSuccess={handleNavigation} />;
  }
};

export default AuthPage; 