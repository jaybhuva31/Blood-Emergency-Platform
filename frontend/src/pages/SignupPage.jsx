import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoWater, IoPersonAddOutline } from 'react-icons/io5';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

const SignupPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'RECEIVER',
    password: '',
    confirm_password: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Front-end password check
    if (formData.password !== formData.confirm_password) {
      setErrors({ confirm_password: "Passwords do not match." });
      setLoading(false);
      return;
    }

    const response = await register(formData);
    setLoading(false);

    if (response.success) {
      // Show success toast and redirect
      setToastMessage("Registration successful! Redirecting to OTP Verification...");
      setTimeout(() => {
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      }, 2000);
    } else {
      // Handle backend errors
      if (typeof response.error === 'object') {
        setErrors(response.error);
      } else {
        setToastMessage(response.error || "Registration failed.");
      }
    }
  };

  return (
    <div className="auth-wrapper">
      {toastMessage && (
        <div className="toast-container-custom">
          <Toast 
            message={toastMessage} 
            type={toastMessage.includes("successful") ? "success" : "danger"} 
            onClose={() => setToastMessage(null)} 
          />
        </div>
      )}

      {loading && <Loader fullPage={true} message="Creating account..." />}

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo d-flex align-items-center justify-content-center">
            <IoWater className="animate-pulse" />
          </div>
          <h3 className="fw-bold">Join LifeFlow</h3>
          <p className="text-muted small">Register to donate or request blood</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted">Register As</label>
            <div className="d-flex gap-3">
              <div className="flex-fill">
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="role" 
                  id="role_receiver" 
                  value="RECEIVER"
                  checked={formData.role === 'RECEIVER'}
                  onChange={handleChange}
                />
                <label className="btn btn-outline-danger w-100 py-2 fw-medium text-uppercase" htmlFor="role_receiver">
                  Receiver
                </label>
              </div>
              <div className="flex-fill">
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="role" 
                  id="role_donor" 
                  value="DONOR"
                  checked={formData.role === 'DONOR'}
                  onChange={handleChange}
                />
                <label className="btn btn-outline-danger w-100 py-2 fw-medium text-uppercase" htmlFor="role_donor">
                  Donor
                </label>
              </div>
            </div>
          </div>

          <div className="row g-2">
            {/* First & Last Name */}
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-semibold text-muted">First Name</label>
              <input 
                type="text" 
                name="first_name"
                className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                value={formData.first_name} 
                onChange={handleChange}
                required
              />
              {errors.first_name && <div className="invalid-feedback">{errors.first_name[0]}</div>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-semibold text-muted">Last Name</label>
              <input 
                type="text" 
                name="last_name"
                className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                value={formData.last_name} 
                onChange={handleChange}
                required
              />
              {errors.last_name && <div className="invalid-feedback">{errors.last_name[0]}</div>}
            </div>
          </div>

          {/* Username */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted">Username</label>
            <input 
              type="text" 
              name="username"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              value={formData.username} 
              onChange={handleChange}
              required
            />
            {errors.username && <div className="invalid-feedback">{errors.username[0]}</div>}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted">Email Address</label>
            <input 
              type="email" 
              name="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={formData.email} 
              onChange={handleChange}
              required
            />
            {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted">Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              value={formData.phone} 
              onChange={handleChange}
              placeholder="+91 XXXXX XXXXX"
              required
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone[0]}</div>}
          </div>

          {/* Passwords */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted">Password</label>
            <input 
              type="password" 
              name="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              value={formData.password} 
              onChange={handleChange}
              required
            />
            {errors.password && <div className="invalid-feedback">{errors.password[0]}</div>}
          </div>
          <div className="mb-4">
            <label className="form-label small fw-semibold text-muted">Confirm Password</label>
            <input 
              type="password" 
              name="confirm_password"
              className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`}
              value={formData.confirm_password} 
              onChange={handleChange}
              required
            />
            {errors.confirm_password && <div className="invalid-feedback">Passwords do not match.</div>}
          </div>

          <button type="submit" className="btn btn-red w-100 py-3 d-flex align-items-center justify-content-center gap-2">
            <IoPersonAddOutline size={18} />
            Create Account
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted small">Already have an account? </span>
          <Link to="/login" className="small text-danger fw-semibold text-decoration-none">Login Here</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
