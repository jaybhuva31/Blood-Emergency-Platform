import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoWater, IoLogInOutline } from 'react-icons/io5';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const response = await login(email, password);
    setLoading(false);

    if (response.success) {
      setToastMessage("Login successful! Redirecting...");
      
      // Redirect based on user role
      setTimeout(() => {
        const userRole = response.user.role;
        if (userRole === 'ADMIN') {
          navigate('/admin-dashboard');
        } else if (userRole === 'DONOR') {
          navigate('/donor-dashboard');
        } else {
          navigate('/receiver-dashboard');
        }
      }, 1500);
    } else {
      setError(response.error);
    }
  };

  return (
    <div className="auth-wrapper">
      {toastMessage && (
        <div className="toast-container-custom">
          <Toast 
            message={toastMessage} 
            type="success" 
            onClose={() => setToastMessage(null)} 
          />
        </div>
      )}

      {loading && <Loader fullPage={true} message="Authenticating..." />}

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo d-flex align-items-center justify-content-center">
            <IoWater className="animate-pulse" />
          </div>
          <h3 className="fw-bold text-dark">LifeFlow Login</h3>
          <p className="text-muted small">Sign in to manage donations and requests</p>
        </div>

        {error && (
          <div className="alert alert-danger p-3 mb-4 rounded-3 small" role="alert">
            <p className="mb-1 fw-semibold">{error}</p>
            {error.includes("verify your OTP") && (
              <Link 
                to={`/verify-otp?email=${encodeURIComponent(email)}`} 
                className="alert-link text-decoration-none fw-bold"
              >
                Click here to verify now &rarr;
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted">Email Address</label>
            <input 
              type="email" 
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-1">
              <label className="form-label small fw-semibold text-muted mb-0">Password</label>
              <Link 
                to="/forgot-password" 
                className="small text-danger text-decoration-none fw-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <input 
              type="password" 
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-red w-100 py-3 d-flex align-items-center justify-content-center gap-2">
            <IoLogInOutline size={20} />
            Sign In
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted small">New to LifeFlow? </span>
          <Link to="/signup" className="small text-danger fw-semibold text-decoration-none">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
