import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  IoWater, 
  IoLogOutOutline, 
  IoPersonCircleOutline, 
  IoSpeedometerOutline, 
  IoCalendarOutline,
  IoMapOutline,
  IoNotificationsOutline,
  IoStatsChartOutline,
  IoTimeOutline,
  IoAddCircleOutline
} from 'react-icons/io5';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Determine dashboard link based on role
  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'ADMIN':
        return '/admin-dashboard';
      case 'DONOR':
        return '/donor-dashboard';
      case 'RECEIVER':
      default:
        return '/receiver-dashboard';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3 sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center fw-bold" to="/" style={{ color: 'var(--primary-red)' }}>
          <IoWater className="me-1 animate-pulse" size={28} />
          <span className="text-dark">Life</span><span style={{ color: 'var(--primary-red)' }}>Flow</span>
        </Link>
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item">
              <Link className="nav-link px-3 fw-medium text-secondary" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-3 fw-medium text-secondary" to="/about">About Us</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-3 fw-medium text-secondary" to="/camps">Donation Camps</Link>
            </li>

            {user ? (
              <>
                {user.role === 'RECEIVER' && (
                  <li className="nav-item">
                    <Link className="nav-link px-3 fw-medium text-danger d-flex align-items-center gap-1" to="/create-request">
                      <IoAddCircleOutline size={18} />
                      Request Blood
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link className="nav-link px-3 fw-medium text-secondary d-flex align-items-center gap-1" to="/map">
                    <IoMapOutline size={18} />
                    Map
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link px-3 fw-medium text-secondary d-flex align-items-center gap-1" to="/notifications">
                    <IoNotificationsOutline size={18} />
                    Alerts
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link px-3 fw-medium text-secondary d-flex align-items-center gap-1" to="/reports">
                    <IoStatsChartOutline size={18} />
                    Reports
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link px-3 fw-medium text-secondary d-flex align-items-center gap-1" to={getDashboardLink()}>
                    <IoSpeedometerOutline size={18} />
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item dropdown ms-lg-2">
                  <a 
                    className="nav-link dropdown-toggle d-flex align-items-center text-dark fw-semibold" 
                    href="#" 
                    id="navbarDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <IoPersonCircleOutline className="me-1 text-secondary" size={22} />
                    {user.username}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2" aria-labelledby="navbarDropdown">
                    <li>
                      <Link className="dropdown-item py-2 d-flex align-items-center gap-2" to="/profile">
                        <IoPersonCircleOutline size={16} />
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2 d-flex align-items-center gap-2" to="/history">
                        <IoTimeOutline size={16} />
                        History Logs
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2 d-flex align-items-center gap-2" to="/settings">
                        Settings
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item py-2 text-danger d-flex align-items-center" onClick={handleLogout}>
                        <IoLogOutOutline className="me-2" size={18} />
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                  <Link className="btn btn-red-outline w-100" to="/login">Login</Link>
                </li>
                <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                  <Link className="btn btn-red w-100" to="/signup">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
