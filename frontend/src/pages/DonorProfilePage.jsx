import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  IoSaveOutline, 
  IoLocationOutline, 
  IoDocumentAttachOutline, 
  IoImageOutline, 
  IoPersonCircleOutline 
} from 'react-icons/io5';

const DonorProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Profile Form States
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    blood_group: 'O+',
    weight: '',
    age: '',
    gender: 'MALE',
    address: '',
    city: '',
    latitude: '',
    longitude: '',
    medical_disease: '',
  });

  // Uploaded Files State
  const [profilePic, setProfilePic] = useState(null);
  const [bloodReport, setBloodReport] = useState(null);

  // Profile metadata
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Feedback states
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Load existing profile details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('donor/profile/');
        const data = response.data;
        setFormData({
          first_name: data.user?.first_name || '',
          last_name: data.user?.last_name || '',
          phone: data.phone || data.user?.phone || '',
          blood_group: data.blood_group,
          weight: data.weight,
          age: data.age,
          gender: data.gender,
          address: data.address,
          city: data.city,
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          medical_disease: data.medical_disease || '',
        });
        setHasProfile(true);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setHasProfile(false);
        } else {
          setToastType('danger');
          setToastMessage("Failed to fetch donor profile details.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // HTML5 GeoLocation lookup (Viva winner feature!)
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setToastType('warning');
      setToastMessage("Geolocation is not supported by your browser.");
      return;
    }

    setToastType('info');
    setToastMessage("Fetching GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        setToastType('success');
        setToastMessage("Coordinates captured successfully!");
      },
      (error) => {
        setToastType('danger');
        setToastMessage("Location permission denied or timeout reached.");
      }
    );
  };

  // Submit Profile Data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    // Create a multi-part form data instance to handle file uploads
    const dataToSend = new FormData();
    dataToSend.append('blood_group', formData.blood_group);
    dataToSend.append('weight', formData.weight);
    dataToSend.append('age', formData.age);
    dataToSend.append('gender', formData.gender);
    dataToSend.append('address', formData.address);
    dataToSend.append('city', formData.city);
    
    if (formData.latitude) dataToSend.append('latitude', formData.latitude);
    if (formData.longitude) dataToSend.append('longitude', formData.longitude);
    if (formData.phone) dataToSend.append('phone', formData.phone);
    if (formData.medical_disease) dataToSend.append('medical_disease', formData.medical_disease);

    // Append nested user parameters
    dataToSend.append('first_name', formData.first_name);
    dataToSend.append('last_name', formData.last_name);

    // Append binary files only if selected
    if (profilePic) {
      dataToSend.append('profile_picture', profilePic);
    }
    if (bloodReport) {
      dataToSend.append('blood_report', bloodReport);
    }

    try {
      let response;
      if (hasProfile) {
        // Update Profile
        response = await api.put('donor/profile/', dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setToastMessage("Donor profile updated successfully!");
      } else {
        // Create Profile
        response = await api.post('donor/profile/', dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setToastMessage("Donor profile created successfully!");
        setHasProfile(true);
      }
      setToastType('success');
      
      // Update local storage authUser first_name/last_name/phone so it stays in sync
      const savedUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      savedUser.first_name = formData.first_name;
      savedUser.last_name = formData.last_name;
      savedUser.phone = formData.phone;
      localStorage.setItem('authUser', JSON.stringify(savedUser));

      setTimeout(() => {
        navigate('/donor-dashboard');
      }, 1500);
    } catch (err) {
      if (err.response && err.response.data) {
        setErrors(err.response.data);
        setToastType('danger');
        setToastMessage("Validation error: Please review highlighted fields.");
      } else {
        setToastType('danger');
        setToastMessage("An error occurred while saving the profile.");
      }
    } finally {
      setSubmitting(false);
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
        <Loader fullPage={true} message="Loading donor details..." />
      ) : (
        <div className="row g-4">
          {/* Sidebar Navigation */}
          <div className="col-lg-3">
            <Sidebar />
          </div>

          {/* Profile Form Content */}
          <div className="col-lg-9">
            <div className="custom-card p-4">
              <div className="d-flex align-items-center gap-3 border-bottom pb-3 mb-4">
                <div className="text-danger">
                  <IoPersonCircleOutline size={40} />
                </div>
                <div>
                  <h4 className="fw-bold mb-0">My Donor Profile</h4>
                  <p className="text-secondary small mb-0">Update biological indexes and availability details</p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Section 1: User Account Details */}
                <h6 className="fw-bold text-danger border-bottom pb-1 mb-3">1. Personal Contact Details</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-muted">First Name</label>
                    <input 
                      type="text" 
                      name="first_name" 
                      className="form-control"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-muted">Last Name</label>
                    <input 
                      type="text" 
                      name="last_name" 
                      className="form-control"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-muted">Contact Phone</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone[0]}</div>}
                  </div>
                </div>

                {/* Section 2: Biological parameters */}
                <h6 className="fw-bold text-danger border-bottom pb-1 mb-3">2. Biological & Medical Indicators</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-muted">Blood Group</label>
                    <select 
                      name="blood_group" 
                      className="form-select"
                      value={formData.blood_group}
                      onChange={handleInputChange}
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
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-muted">Weight (kg)</label>
                    <input 
                      type="number" 
                      name="weight" 
                      className={`form-control ${errors.weight ? 'is-invalid' : ''}`}
                      value={formData.weight}
                      onChange={handleInputChange}
                      min={45} // medical threshold
                      required
                    />
                    {errors.weight && <div className="invalid-feedback">{errors.weight[0]}</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-muted">Age</label>
                    <input 
                      type="number" 
                      name="age" 
                      className={`form-control ${errors.age ? 'is-invalid' : ''}`}
                      value={formData.age}
                      onChange={handleInputChange}
                      min={18} // legal threshold
                      max={65}
                      required
                    />
                    {errors.age && <div className="invalid-feedback">{errors.age[0]}</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-muted">Gender</label>
                    <select 
                      name="gender" 
                      className="form-select"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="col-md-8">
                    <label className="form-label small fw-semibold text-muted">Medical History / Diseases</label>
                    <input 
                      type="text" 
                      name="medical_disease" 
                      className="form-control"
                      value={formData.medical_disease}
                      onChange={handleInputChange}
                      placeholder="Specify if any (e.g. Diabetes, Hypertension, None)"
                    />
                  </div>
                </div>

                {/* Section 3: Geolocation Coordinates */}
                <h6 className="fw-bold text-danger border-bottom pb-1 mb-3">3. Location & Geolocation Coordinates</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-muted">City</label>
                    <input 
                      type="text" 
                      name="city" 
                      className="form-control"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Mumbai, Pune"
                      required
                    />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label small fw-semibold text-muted">Home Address</label>
                    <input 
                      type="text" 
                      name="address" 
                      className="form-control"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street name, landmark..."
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-muted">Latitude</label>
                    <input 
                      type="number" 
                      step="any"
                      name="latitude" 
                      className="form-control"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      placeholder="18.9750"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-muted">Longitude</label>
                    <input 
                      type="number" 
                      step="any"
                      name="longitude" 
                      className="form-control"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      placeholder="72.8258"
                    />
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <button 
                      type="button" 
                      onClick={handleGetLocation} 
                      className="btn btn-red-outline w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                    >
                      <IoLocationOutline size={18} />
                      Detect GPS
                    </button>
                  </div>
                </div>

                {/* Section 4: File Uploads */}
                <h6 className="fw-bold text-danger border-bottom pb-1 mb-3">4. Profile Picture & Blood Report Upload</h6>
                <div className="row g-3 mb-5">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted d-flex align-items-center gap-1">
                      <IoImageOutline />
                      Profile Picture (JPG/PNG)
                    </label>
                    <input 
                      type="file" 
                      className="form-control" 
                      accept="image/*"
                      onChange={(e) => setProfilePic(e.target.files[0])}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted d-flex align-items-center gap-1">
                      <IoDocumentAttachOutline />
                      Recent Blood Pathology Report (PDF)
                    </label>
                    <input 
                      type="file" 
                      className="form-control" 
                      accept=".pdf"
                      onChange={(e) => setBloodReport(e.target.files[0])}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="btn btn-red px-5 py-3 d-flex align-items-center justify-content-center gap-2 m-auto"
                >
                  <IoSaveOutline size={18} />
                  {submitting ? "Saving changes..." : "Save Donor Profile"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorProfilePage;
