import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { IoTimeOutline, IoArrowForwardOutline } from 'react-icons/io5';

const DonationHistoryPage = () => {
  const { user } = useAuth();
  
  // States
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Feedback
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  const fetchRequests = async () => {
    try {
      const response = await api.get('requests/list/');
      setRequests(response.data);
    } catch (err) {
      setToastType('danger');
      setToastMessage("Failed to retrieve donation history logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter criteria
  const filteredRequests = requests.filter(req => {
    if (filterStatus === 'ALL') return true;
    return req.status === filterStatus;
  });

  const getStatusBadgeColor = (statusVal) => {
    switch (statusVal) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warning text-dark';
      case 'ACCEPTED': return 'info text-white';
      case 'CANCELLED': return 'secondary';
      default: return 'danger';
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
        <Loader fullPage={true} message="Fetching transaction logs..." />
      ) : (
        <div className="row g-4">
          {/* Sidebar */}
          <div className="col-lg-3">
            <Sidebar />
          </div>

          {/* Main List */}
          <div className="col-lg-9">
            <div className="custom-card p-4">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4 flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="text-danger">
                    <IoTimeOutline size={36} />
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0">Donation & Request History</h4>
                    <p className="text-secondary small mb-0">Review all records and active tracker flows</p>
                  </div>
                </div>

                {/* Filters */}
                <div>
                  <select 
                    className="form-select form-select-sm"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {filteredRequests.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="py-3 px-3">Req ID</th>
                        <th className="py-3">Patient</th>
                        <th className="py-3">Blood Group</th>
                        <th className="py-3">Units</th>
                        <th className="py-3">Target Date</th>
                        <th className="py-3 text-center">Status</th>
                        <th className="py-3 px-3 text-end">Track</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((req) => (
                        <tr key={req.id}>
                          <td className="py-3 px-3 fw-bold text-dark">{req.request_id}</td>
                          <td className="py-3 text-secondary">{req.patient_name}</td>
                          <td className="py-3 fw-semibold text-danger">{req.blood_group}</td>
                          <td className="py-3 fw-semibold">{req.units_required}</td>
                          <td className="py-3 text-muted small">{req.required_date}</td>
                          <td className="py-3 text-center">
                            <span className={`badge bg-${getStatusBadgeColor(req.status)} px-3 py-2 rounded-pill small fw-semibold`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-end">
                            <Link 
                              to={`/track-request/${req.request_id}`} 
                              className="btn btn-red btn-sm px-3 rounded-3 d-inline-flex align-items-center gap-1 text-decoration-none"
                            >
                              Track
                              <IoArrowForwardOutline />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState 
                  message="No matching history logs found." 
                  subMessage="Modify the filter dropdown or submit a request to create transaction entries."
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationHistoryPage;
