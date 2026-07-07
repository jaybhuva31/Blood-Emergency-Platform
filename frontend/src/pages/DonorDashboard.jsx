import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatisticsCard from '../components/StatisticsCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  IoWater, 
  IoCalendarOutline, 
  IoCheckboxOutline, 
  IoWarningOutline, 
  IoArrowForwardOutline,
  IoHeartOutline
} from 'react-icons/io5';

const DonorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Page States
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  
  // Feedback
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      // 1. Fetch Profile
      const profileRes = await api.get('donor/profile/');
      setProfile(profileRes.data);
      setHasProfile(true);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setHasProfile(false);
      } else {
        setToastType('danger');
        setToastMessage("Failed to load donor profile.");
      }
    }

    try {
      // 2. Fetch Donation History
      const historyRes = await api.get('donor/history/');
      setHistory(historyRes.data);
    } catch (err) {
      setToastType('danger');
      setToastMessage("Failed to load donation history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle Availability Toggle Switch
  const handleAvailabilityToggle = async () => {
    if (!hasProfile) {
      setToastType('warning');
      setToastMessage("Please create your profile before changing availability.");
      return;
    }

    setToggleLoading(true);
    try {
      const response = await api.patch('donor/profile/availability/');
      setProfile(prev => ({
        ...prev,
        availability: response.data.availability,
        status: response.data.status
      }));
      setToastType('success');
      setToastMessage(`Status updated to: ${response.data.status}`);
    } catch (err) {
      setToastType('danger');
      setToastMessage("Failed to toggle availability.");
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {toastMessage && (
        <div className="toast-container-custom">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
        </div>
      )}

      {loading ? (
        <Loader fullPage={true} message="Loading dashboard panels..." />
      ) : (
        <div className="row g-4">
          {/* Dashboard Left Sidebar */}
          <div className="col-lg-3">
            <Sidebar />
          </div>

          {/* Dashboard Main Content */}
          <div className="col-lg-9">
            {/* Header Greeting */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-bold mb-1">Hello, {user.first_name || user.username}!</h3>
                <p className="text-secondary small mb-0">Welcome back to your donor control panel.</p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className="small fw-semibold text-muted">Availability Status</span>
                <div className="form-check form-switch fs-4 mb-0">
                  <input 
                    className="form-check-input check-danger cursor-pointer" 
                    type="checkbox" 
                    id="availabilitySwitch"
                    checked={profile ? profile.availability : false}
                    onChange={handleAvailabilityToggle}
                    disabled={toggleLoading || !hasProfile}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            {/* Profile Setup Warning Call to Action */}
            {!hasProfile && (
              <div className="alert alert-warning border-0 p-4 mb-4 rounded-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-warning bg-opacity-25 text-warning rounded-circle p-2 d-flex align-items-center justify-content-center">
                    <IoWarningOutline size={26} />
                  </div>
                  <div>
                    <h5 className="alert-heading fw-bold mb-1">Setup Your Donor Profile</h5>
                    <p className="mb-0 small text-dark">You must register your biological details (blood group, weight, etc.) before you can receive emergency requests.</p>
                  </div>
                </div>
                <Link to="/profile" className="btn btn-warning fw-semibold px-4 py-2 text-dark d-flex align-items-center gap-2">
                  Complete Profile
                  <IoArrowForwardOutline />
                </Link>
              </div>
            )}

            {/* Statistics Row */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <StatisticsCard 
                  title="Blood Group"
                  value={profile ? profile.blood_group : "N/A"}
                  icon={<IoWater size={24} />}
                  description={hasProfile ? "Biological blood type" : "Complete profile to set"}
                />
              </div>
              <div className="col-md-4">
                <StatisticsCard 
                  title="Total Donations"
                  value={profile ? profile.donation_count : "0"}
                  icon={<IoHeartOutline size={24} />}
                  description="Lifetime completed saves"
                />
              </div>
              <div className="col-md-4">
                <StatisticsCard 
                  title="Last Donated"
                  value={profile && profile.last_donation_date ? profile.last_donation_date : "Never"}
                  icon={<IoCalendarOutline size={24} />}
                  description="Required 3-month interval"
                />
              </div>
            </div>

            {/* Donation History Section */}
            <div className="custom-card p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                <IoCheckboxOutline className="text-danger" />
                Recent Donations
              </h5>
              
              {history.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3">Patient</th>
                        <th className="py-3">Location</th>
                        <th className="py-3">Quantity</th>
                        <th className="py-3 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 px-3 fw-semibold text-secondary">{item.date}</td>
                          <td className="py-3 text-dark">{item.patient_name}</td>
                          <td className="py-3 text-muted">{item.hospital}</td>
                          <td className="py-3 fw-semibold">{item.units} Unit(s)</td>
                          <td className="py-3 px-3">
                            <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill small fw-semibold">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState 
                  message="No donation records found." 
                  subMessage={hasProfile ? "You have not completed any emergency donations yet." : "Register your biological details to start receiving matches."} 
                />
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
