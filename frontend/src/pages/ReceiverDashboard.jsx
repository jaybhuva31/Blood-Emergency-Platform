import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatisticsCard from '../components/StatisticsCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  IoWarningOutline, 
  IoSearchOutline, 
  IoPersonCircleOutline, 
  IoCallOutline, 
  IoWaterOutline, 
  IoSparklesOutline,
  IoLocationOutline
} from 'react-icons/io5';

const ReceiverDashboard = () => {
  const { user } = useAuth();

  // Page States
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  
  // Search parameters for nearby donors
  const [searchParams, setSearchParams] = useState({
    blood_group: 'O+',
    city: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Feedback states
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Load Receiver request details
  const loadReceiverData = async () => {
    try {
      const response = await api.get('receiver/profile/');
      setProfile(response.data);
      setHasProfile(true);
      // Auto-set the search blood group to match what the receiver needs
      setSearchParams(prev => ({
        ...prev,
        blood_group: response.data.blood_group_needed,
        city: response.data.city || ''
      }));
      // Run automatic search based on profile needs
      fetchNearbyDonors(response.data.blood_group_needed, response.data.city || '');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setHasProfile(false);
      } else {
        setToastType('danger');
        setToastMessage("Failed to fetch receiver request details.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceiverData();
  }, []);

  // Fetch Available Donors
  const fetchNearbyDonors = async (bloodGroup, city) => {
    setSearching(true);
    try {
      const params = {};
      if (bloodGroup) params.blood_group = bloodGroup;
      if (city) params.city = city;

      const response = await api.get('donor/nearby/', { params });
      setSearchResults(response.data);
    } catch (err) {
      setToastType('danger');
      setToastMessage("Failed to fetch compatible donors.");
    } finally {
      setSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNearbyDonors(searchParams.blood_group, searchParams.city);
  };

  return (
    <div className="container py-4">
      {toastMessage && (
        <div className="toast-container-custom">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
        </div>
      )}

      {loading ? (
        <Loader fullPage={true} message="Loading receiver panels..." />
      ) : (
        <div className="row g-4">
          {/* Sidebar */}
          <div className="col-lg-3">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="col-lg-9">
            {/* Header Greeting */}
            <div className="mb-4">
              <h3 className="fw-bold mb-1">Welcome, {user.first_name || user.username}!</h3>
              <p className="text-secondary small mb-0">Search compatible donors and check your emergency blood request status.</p>
            </div>

            {/* Profile setup warning alert */}
            {!hasProfile && (
              <div className="alert alert-warning border-0 p-4 mb-4 rounded-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-warning bg-opacity-25 text-warning rounded-circle p-2 d-flex align-items-center justify-content-center">
                    <IoWarningOutline size={26} />
                  </div>
                  <div>
                    <h5 className="alert-heading fw-bold mb-1">Create Blood Request Profile</h5>
                    <p className="mb-0 small text-dark">You have not registered any emergency blood requirements. Create a profile now to search and contact compatible donors.</p>
                  </div>
                </div>
                <Link to="/profile" className="btn btn-warning fw-semibold px-4 py-2 text-dark">
                  Create Request Profile
                </Link>
              </div>
            )}

            {/* Active Request Details */}
            {hasProfile && profile && (
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="custom-card p-4 h-100 bg-white border-start border-danger border-4">
                    <h6 className="text-danger fw-bold text-uppercase small mb-3">Active Emergency Details</h6>
                    <h4 className="fw-bold text-dark mb-1">{profile.patient_name}</h4>
                    <p className="small text-muted mb-3">Patient Name</p>
                    <div className="row g-2 text-secondary small">
                      <div className="col-6"><strong>Required Date:</strong> {profile.required_date}</div>
                      <div className="col-6"><strong>Required Time:</strong> {profile.required_time}</div>
                      <div className="col-6"><strong>Units Required:</strong> {profile.units_required} Unit(s)</div>
                      <div className="col-6">
                        <strong>Urgency:</strong> 
                        <span className={`ms-1 badge bg-${profile.emergency_level === 'CRITICAL' ? 'danger' : profile.emergency_level === 'HIGH' ? 'warning text-dark' : 'success'}`}>
                          {profile.emergency_level}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="custom-card p-4 h-100 bg-white">
                    <h6 className="text-secondary fw-bold text-uppercase small mb-3">Hospital Location</h6>
                    <h5 className="fw-bold text-dark mb-1">{profile.hospital_name}</h5>
                    <p className="small text-muted mb-3 d-flex align-items-start gap-1">
                      <IoLocationOutline className="text-danger flex-shrink-0 mt-1" />
                      {profile.hospital_address}
                    </p>
                    {profile.remarks && (
                      <div className="p-3 bg-light rounded-3 small text-muted">
                        <strong>Remarks:</strong> {profile.remarks}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Donor Search Section */}
            <div className="custom-card p-4 mb-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                <IoSearchOutline className="text-danger" />
                Find Compatible Donors
              </h5>

              <form onSubmit={handleSearchSubmit} className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-muted">Blood Group Needed</label>
                  <select 
                    className="form-select"
                    value={searchParams.blood_group}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, blood_group: e.target.value }))}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="col-md-5">
                  <label className="form-label small fw-semibold text-muted">Search City</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Mumbai, Pune"
                    value={searchParams.city}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button type="submit" disabled={searching} className="btn btn-red w-100 py-2 d-flex align-items-center justify-content-center gap-2">
                    <IoSearchOutline size={18} />
                    {searching ? "Searching..." : "Search Donors"}
                  </button>
                </div>
              </form>

              {/* Donor results grid */}
              <h6 className="fw-bold text-secondary border-bottom pb-2 mb-3">Compatible Available Donors ({searchResults.length})</h6>
              
              {searching ? (
                <Loader message="Scanning database..." />
              ) : searchResults.length > 0 ? (
                <div className="row g-3">
                  {searchResults.map((donor) => (
                    <div className="col-md-6" key={donor.id}>
                      <div className="p-3 border rounded-3 bg-white hover-shadow transition d-flex align-items-center gap-3">
                        <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5" style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                          {donor.blood_group}
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <h6 className="fw-bold mb-1 text-dark text-truncate">
                            {donor.user?.first_name} {donor.user?.last_name}
                          </h6>
                          <p className="small text-muted mb-1 d-flex align-items-center gap-1">
                            <IoLocationOutline className="text-danger" size={14} />
                            {donor.city}
                          </p>
                          <a href={`tel:${donor.phone || donor.user?.phone}`} className="small text-danger fw-semibold text-decoration-none d-flex align-items-center gap-1">
                            <IoCallOutline size={14} />
                            {donor.phone || donor.user?.phone || 'No Phone'}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  message="No compatible donors found." 
                  subMessage="Try modifying the search filter parameters or extending the search to other cities."
                />
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiverDashboard;
