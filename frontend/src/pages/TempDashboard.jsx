import React from 'react';
import { useAuth } from '../context/AuthContext';
import { IoPersonCircle, IoLogOutOutline, IoWater, IoCalendarOutline, IoStatsChartOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const TempDashboard = ({ title = "Dashboard" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <h4>Access Denied</h4>
        <p className="text-muted">Please log in to access this page.</p>
        <button className="btn btn-red mt-2" onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row g-4">
        {/* Sidebar/Welcome Card */}
        <div className="col-lg-4">
          <div className="custom-card p-4 text-center">
            <div className="text-danger mb-3">
              <IoPersonCircle size={80} />
            </div>
            <h4 className="fw-bold mb-1">{user.first_name} {user.last_name}</h4>
            <span className="badge-red mb-3 d-inline-block text-uppercase">{user.role}</span>
            <hr className="my-3" />
            <div className="text-start mb-4 small text-muted">
              <div className="mb-2"><strong>Username:</strong> {user.username}</div>
              <div className="mb-2"><strong>Email:</strong> {user.email}</div>
              <div className="mb-2"><strong>Phone:</strong> {user.phone || 'Not Provided'}</div>
              <div className="mb-2"><strong>Status:</strong> Verified & Active</div>
            </div>
            <button className="btn btn-red-outline w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleLogout}>
              <IoLogOutOutline size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="col-lg-8">
          <div className="custom-card p-4 mb-4">
            <h3 className="fw-bold text-dark d-flex align-items-center gap-2">
              <IoWater className="text-danger animate-pulse" />
              Welcome to the {title}
            </h3>
            <p className="text-muted mt-2">
              You have successfully authenticated using the JWT OTP Verification flow. This dashboard is a temporary placeholder for <strong>Part 1</strong>. In <strong>Part 2</strong>, we will implement full dashboard functionalities including donor updates, request dispatchers, tables, and Leaflet Maps!
            </p>
            <div className="alert alert-danger bg-danger bg-opacity-10 text-danger border-0 p-3 mt-3 rounded-3 small">
              <strong>College Project Viva Note:</strong> Explain how Django generates a 6-digit OTP code, stores it in the database with an expiration time, prints it to the console, and verifies it. Once verified, simplejwt provides a token which Axios appends to headers for all subsequent API requests.
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="row g-3">
            <div className="col-sm-6">
              <div className="custom-card p-3 d-flex align-items-center gap-3">
                <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-2">
                  <IoStatsChartOutline size={24} />
                </div>
                <div>
                  <h6 className="text-muted mb-0 small">Emergency Requests</h6>
                  <p className="fw-bold mb-0 text-dark">Ready to load</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="custom-card p-3 d-flex align-items-center gap-3">
                <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-2">
                  <IoCalendarOutline size={24} />
                </div>
                <div>
                  <h6 className="text-muted mb-0 small">Donation Camps</h6>
                  <p className="fw-bold mb-0 text-dark">Ready to load</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempDashboard;
