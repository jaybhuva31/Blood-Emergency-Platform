import React from 'react';
import { Link } from 'react-router-dom';
import { IoWater, IoCallOutline, IoMailOutline, IoLocationOutline } from 'react-icons/io5';

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-3 mt-auto">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center mb-3 text-white fw-bold fs-4">
              <IoWater className="text-danger me-1" size={26} />
              LifeFlow
            </div>
            <p className="text-muted small mb-3">
              A real-time emergency blood request platform connecting voluntary donors with patients during critical emergencies.
            </p>
            <span className="badge-red fs-6 py-1 px-3 d-inline-block">Emergency Helpline: 108</span>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-semibold mb-3">Quick Links</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none small hover-text-white">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-muted text-decoration-none small hover-text-white">About Us</Link>
              </li>
              <li className="mb-2">
                <Link to="/camps" className="text-muted text-decoration-none small hover-text-white">Donation Camps</Link>
              </li>
              <li className="mb-2">
                <Link to="/login" className="text-muted text-decoration-none small hover-text-white">Login Portal</Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-semibold mb-3">Donor Roles</h6>
            <ul className="list-unstyled mb-0 text-muted small">
              <li className="mb-2">A+ / A- / B+ / B- Blood Types</li>
              <li className="mb-2">AB+ / AB- / O+ / O- Types</li>
              <li className="mb-2">Find Nearby Emergency Requests</li>
              <li className="mb-2">Earn Blood Donation Certificates</li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-semibold mb-3">Contact Us</h6>
            <ul className="list-unstyled mb-0 text-muted small">
              <li className="d-flex align-items-center mb-2">
                <IoCallOutline className="me-2 text-danger" size={16} />
                +91 98765 43210
              </li>
              <li className="d-flex align-items-center mb-2">
                <IoMailOutline className="me-2 text-danger" size={16} />
                support@lifeflow.com
              </li>
              <li className="d-flex align-items-center mb-2">
                <IoLocationOutline className="me-2 text-danger" size={16} />
                College Campus, Main Road, India
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary my-4" />
        
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="text-muted small mb-0">
            &copy; {new Date().getFullYear()} LifeFlow - Blood Donor Emergency System. All Rights Reserved.
          </p>
          <p className="text-muted small mb-0 mt-2 mt-md-0">
            Developed as a College semester 4 project.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
