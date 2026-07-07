import React from 'react';
import { Link } from 'react-router-dom';
import { IoWaterOutline, IoSearchOutline, IoNotificationsOutline, IoCalendarOutline, IoLocationOutline, IoHeartCircleOutline } from 'react-icons/io5';

const LandingPage = () => {
  return (
    <div>
      {/* Hero Banner */}
      <header className="hero-section">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge-red mb-3 d-inline-block">Emergency Blood Network</span>
              <h1 className="hero-title mb-3">
                Connecting <span>Life</span> Savers In Real-Time.
              </h1>
              <p className="hero-subtitle mb-4">
                LifeFlow matches voluntary blood donors with emergency receiver requests near their location immediately. Sign up today and help save lives.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/signup" className="btn btn-red d-flex align-items-center">
                  Register as Donor
                </Link>
                <Link to="/signup" className="btn btn-red-outline d-flex align-items-center">
                  Request Blood
                </Link>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div className="p-4 bg-white rounded-4 shadow-sm border border-danger border-opacity-10 d-inline-block">
                <div className="d-flex flex-column gap-3 text-start" style={{ maxWidth: '350px' }}>
                  <h5 className="fw-bold mb-0 text-dark">Active Blood Requests</h5>
                  <div className="p-3 bg-light rounded-3 border-start border-danger border-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-semibold text-dark">O+ Needed (Emergency)</span>
                      <span className="badge bg-danger">Critical</span>
                    </div>
                    <p className="small text-muted mb-0">City Hospital, Mumbai</p>
                    <p className="small text-muted">2 units required • Date: Today</p>
                  </div>
                  <div className="p-3 bg-light rounded-3 border-start border-warning border-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-semibold text-dark">B- Needed (High)</span>
                      <span className="badge bg-warning text-dark">High</span>
                    </div>
                    <p className="small text-muted mb-0">Metro Clinic, Pune</p>
                    <p className="small text-muted">4 units required • Date: Tomorrow</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Statistics Section */}
      <section className="py-5 bg-white border-bottom">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div className="p-3">
                <h2 className="fw-bold text-danger mb-1">1,250+</h2>
                <p className="text-muted small uppercase fw-semibold mb-0">Registered Donors</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 border-start-md">
                <h2 className="fw-bold text-danger mb-1">450+</h2>
                <p className="text-muted small uppercase fw-semibold mb-0">Emergency Requests</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 border-start-md">
                <h2 className="fw-bold text-danger mb-1">98%</h2>
                <p className="text-muted small uppercase fw-semibold mb-0">Success Rate</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 border-start-md">
                <h2 className="fw-bold text-danger mb-1">15+</h2>
                <p className="text-muted small uppercase fw-semibold mb-0">Donation Camps Active</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">How The System Works</h2>
            <p className="text-muted" style={{ maxWidth: '500px', margin: '0 auto' }}>
              Our platform streamlines communication between blood banks, receivers, and donors.
            </p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="custom-card p-4 h-100 text-center">
                <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-3 d-inline-block mb-3">
                  <IoSearchOutline size={30} />
                </div>
                <h5 className="fw-bold">1. Submit Request</h5>
                <p className="text-muted small mb-0">
                  Receivers or hospitals post emergency requirements specifying blood group, units, location, and severity level.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="custom-card p-4 h-100 text-center">
                <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-3 d-inline-block mb-3">
                  <IoNotificationsOutline size={30} />
                </div>
                <h5 className="fw-bold">2. Instantly Match & Notify</h5>
                <p className="text-muted small mb-0">
                  Our system filters nearby active donors with matching blood groups and notifies them instantly through emails and alerts.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="custom-card p-4 h-100 text-center">
                <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-3 d-inline-block mb-3">
                  <IoHeartCircleOutline size={30} />
                </div>
                <h5 className="fw-bold">3. Save A Life</h5>
                <p className="text-muted small mb-0">
                  Donors accept the request, travel to the location, and complete the donation. The system tracks the status in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
