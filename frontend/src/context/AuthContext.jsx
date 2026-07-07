import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on initial load
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login Function
  const login = async (email, password) => {
    try {
      const response = await api.post('accounts/login/', { email, password });
      const { tokens, user: userData } = response.data;
      
      // Save tokens and user to localStorage
      localStorage.setItem('authToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      // Update state
      setToken(tokens.access);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      const errorMsg = error.response?.data?.non_field_errors?.[0] || 
                       error.response?.data?.detail || 
                       error.response?.data?.message || 
                       "Invalid email or password.";
      return { success: false, error: errorMsg };
    }
  };

  // Register Function
  const register = async (userData) => {
    try {
      const response = await api.post('accounts/register/', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || { message: "Registration failed. Please check your inputs." } 
      };
    }
  };

  // OTP Verification Function
  const verifyOtp = async (email, otpCode) => {
    try {
      const response = await api.post('accounts/verify-otp/', { email, otp_code: otpCode });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.otp_code?.[0] || 
               error.response?.data?.email?.[0] || 
               "OTP verification failed." 
      };
    }
  };

  // Resend OTP Function
  const resendOtp = async (email) => {
    try {
      const response = await api.post('accounts/resend-otp/', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.email?.[0] || "Failed to resend OTP." 
      };
    }
  };

  // Forgot Password Function
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('accounts/forgot-password/', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.email?.[0] || "Failed to send reset code." 
      };
    }
  };

  // Reset Password Function
  const resetPassword = async (email, otpCode, newPassword, confirmPassword) => {
    try {
      const response = await api.post('accounts/reset-password/', {
        email,
        otp_code: otpCode,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.otp_code?.[0] || 
               error.response?.data?.new_password?.[0] || 
               error.response?.data?.non_field_errors?.[0] || 
               "Password reset failed." 
      };
    }
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
