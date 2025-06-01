import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const OTPlessAppId = '9DRP3BQPAKLIZYTVT2JS';

const AuthScreen = () => {
  const { role = 'Student' } = useParams();
  const navigate = useNavigate();
  const [loginStatus, setLoginStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.id = 'otpless-sdk';
    script.type = 'text/javascript';
    script.src = 'https://otpless.com/v4/auth.js';
    script.setAttribute('data-appid', OTPlessAppId);
    document.body.appendChild(script);

    window.otpless = (response) => {
      setIsLoading(false);
      if (!response || !response.token) {
        const errorMsg = response?.errorMessage || 'Login failed';
        setLoginStatus(`Error: ${errorMsg}`);
        alert(errorMsg);
        return;
      }
      setUserData(response);
      setVerificationStatus('Verifying token...');
      setLoginStatus('Completing authentication...');
      verifyTokenWithBackend(response.token);
    };

    return () => {
      document.getElementById('otpless-sdk')?.remove();
      delete window.otpless;
    };
  }, []);

  const verifyTokenWithBackend = async (token) => {
    try {
      const VERIFICATION_URL = `/api/${role.toLowerCase()}/validate-token/`;
      setVerificationStatus('Verifying with backend...');

      const response = await axios.post(VERIFICATION_URL, { token }, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      });

      if (response.data.success) {
        setVerificationStatus(`Verification successful: ${response.data.message}`);
        const dashboardRoute = role === 'Student' ? '/student/dashboard' : '/teacher/dashboard';
        if (response.data.is_new_user) {
          navigate('/complete-profile', { state: { userData: response.data } });
        } else {
          navigate(dashboardRoute, { state: { userData: response.data } });
        }
      } else {
        setVerificationStatus(`Verification failed: ${response.data.message}`);
        alert(response.data.message || 'Could not verify your identity. Please try again.');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      setVerificationStatus(`Verification error: ${errorMsg}`);
      alert(errorMsg);
    }
  };

  const handleLogin = () => {
    setIsLoading(true);
    setLoginStatus('');
    setVerificationStatus('');
    document.getElementById('otpless-login-page')?.click();
  };

  const renderUserInfo = () => {
    if (!userData) return null;
    return (
      <div className="w-full p-4 bg-white rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">User Information</h3>
        {userData.token && <p className="text-sm text-gray-600">Token: {userData.token.substring(0, 15)}...</p>}
        {userData.userId && <p className="text-sm text-gray-600">User ID: {userData.userId}</p>}
        {userData.identities && userData.identities.length > 0 && (
          <>
            <h4 className="text-base font-semibold text-gray-700 mt-4">Identity</h4>
            <p className="text-sm text-gray-600">Type: {userData.identities[0].identityType}</p>
            <p className="text-sm text-gray-600">Value: {userData.identities[0].identityValue}</p>
            {userData.identities[0].name && <p className="text-sm text-gray-600">Name: {userData.identities[0].name}</p>}
          </>
        )}
        {verificationStatus && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg border-l-4 border-indigo-600">
            <p className="text-sm text-gray-900">{verificationStatus}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          
          <motion.h1
            className="text-3xl font-bold text-gray-900 text-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {role} Sign In
          </motion.h1>
        </motion.div>
        <motion.div
          className="p-6 bg-gray-100 bg-opacity-80 rounded-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-lg text-gray-900 mb-8">Sign in to access your {role.toLowerCase()} dashboard</p>
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
              <p className="mt-4 text-base text-gray-600">Signing in...</p>
            </div>
          ) : (
            <>
              <button
                id="otpless-login-page"
                className="w-full h-12 bg-indigo-600 text-white rounded-lg text-base font-bold hover:bg-indigo-700"
                onClick={handleLogin}
              >
                Login
              </button>
              {loginStatus && (
                <div
                  className={`mt-5 p-4 rounded-lg ${loginStatus.includes('Error') ? 'bg-red-50 border-l-4 border-red-500' : 'bg-green-50 border-l-4 border-green-500'}`}
                >
                  <p className="text-sm text-gray-900">{loginStatus}</p>
                </div>
              )}
              {renderUserInfo()}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthScreen;