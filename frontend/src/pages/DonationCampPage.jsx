import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { IoCalendarOutline, IoLocationOutline, IoArrowForwardOutline } from 'react-icons/io5';

const DonationCampPage = () => {
  const { user } = useAuth();

  // States
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('UPCOMING');
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  const fetchCamps = async () => {
    setLoading(true);
    try {
      const response = await api.get(`camp/list/?status=${statusFilter}`);
      setCamps(response.data);
    } catch (err) {
      setToastType('danger');
      setToastMessage("Failed to retrieve donation camps list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, [statusFilter]);

  return (
    <div className="container py-4">
      {toastMessage && (
        <div className="toast-container-custom">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
        </div>
      )}

      {loading ? (
        <Loader fullPage={true} message="Accessing camp registry..." />
      ) : (
        <div className="row g-4">
          {/* Sidebar */}
          <div className="col-lg-3">
            <Sidebar />
          </div>

          {/* List panel */}
          <div className="col-lg-9">
            <div className="custom-card p-4">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4 flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="text-danger">
                    <IoCalendarOutline size={36} />
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0">Blood Donation Camps</h4>
                    <p className="text-secondary small mb-0">Join nearby blood camps and earn certification awards</p>
                  </div>
                </div>

                {/* Filter Toggles */}
                <div className="btn-group" role="group">
                  <button 
                    onClick={() => setStatusFilter('UPCOMING')}
                    className={`btn btn-sm ${statusFilter === 'UPCOMING' ? 'btn-red' : 'btn-outline-danger'}`}
                  >
                    Upcoming
                  </button>
                  <button 
                    onClick={() => setStatusFilter('COMPLETED')}
                    className={`btn btn-sm ${statusFilter === 'COMPLETED' ? 'btn-red' : 'btn-outline-danger'}`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {camps.length > 0 ? (
                <div className="row g-3">
                  {camps.map((camp) => (
                    <div className="col-md-6" key={camp.id}>
                      <div className="custom-card p-4 h-100 d-flex flex-column border">
                        <div className="mb-2">
                          <span className={`badge bg-${camp.status === 'UPCOMING' ? 'danger' : 'secondary'} uppercase small fw-bold px-2 py-1`}>
                            {camp.status}
                          </span>
                        </div>
                        <h5 className="fw-bold text-dark mb-1">{camp.name}</h5>
                        <p className="text-muted small mb-3">Organized by: {camp.organizer}</p>
                        
                        <div className="text-secondary small mb-4">
                          <div className="mb-2 d-flex align-items-center gap-2">
                            <IoCalendarOutline className="text-danger" />
                            <strong>Date/Time:</strong> {camp.date} @ {camp.time.substring(0, 5)}
                          </div>
                          <div className="d-flex align-items-start gap-2">
                            <IoLocationOutline className="text-danger flex-shrink-0 mt-1" />
                            <span><strong>Location:</strong> {camp.location}</span>
                          </div>
                        </div>

                        {/* Direct link button */}
                        <div className="mt-auto">
                          <Link 
                            to={`/camps/${camp.id}`} 
                            className="btn btn-red-outline btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                          >
                            View Details & Register
                            <IoArrowForwardOutline />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  message="No donation camps scheduled." 
                  subMessage="Modify the upcoming/completed toggles or contact administrators for upcoming camp dates."
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationCampPage;
