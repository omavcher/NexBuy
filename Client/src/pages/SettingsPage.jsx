import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Include the default styling
import './css/SettingsPage.css';
import Header from '../components/Header.jsx';
import api from '../api'; // Assuming you have an axios instance configured

const SettingsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatNewPassword, setRepeatNewPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token');
  const locationId = 'settings-page'; // Or any relevant location ID if needed

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const response = await api.get(`/api/user-details?locationId=${locationId}`, {
          headers: {
            'Authorization': `Bearer ${isAuthenticated}`,
          }
        });

        if (response.status !== 200) {
          throw new Error('Network response was not ok');
        }

        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [isAuthenticated, locationId]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handlePasswordChangeClick = () => {
    setPasswordVisible(true);
  };

  const handleCloseModal = () => {
    setPasswordVisible(false);
    setOldPassword('');
    setNewPassword('');
    setRepeatNewPassword('');
    setError(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleChangePassword = async () => {
    if (newPassword !== repeatNewPassword) {
      setError('New passwords do not match');
      return;
    }
  
    try {
      const response = await api.post('/api/change-password', {
        oldPassword,
        newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${isAuthenticated}`,
        }
      });
  
      if (response.status === 200) {
        alert('Password changed successfully');
        handleCloseModal();
      } else {
        throw new Error('Failed to change password');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError('Old password is incorrect');
      } else {
        setError('Error changing password: ' + error.message);
      }
    }
  };
  

  if (loading) {
    return (
      <div className="skeleton-wrapper">
        <Skeleton height={30} width={200} style={{ margin: '20px 0' }} />
        <Skeleton height={20} width={250} />
        <Skeleton count={5} height={40} style={{ margin: '20px 0' }} />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <Header />
      <div className="settings-container">
        <h1>Settings</h1>

        <div className="section personal-info">
          <h2>Personal Information</h2>
          <div className="input-group">
            <label>Full name</label>
            <input type="text" value={user.name} disabled />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="text" value={user.email} disabled />
          </div>
          <div className="input-group">
            <label>Mobile Number</label>
            <input type="text" value={user.mobile} disabled />
          </div>
        </div>

        <div className="section password">
          <h2>Password</h2>
          <div className="input-group password-group">
            <label>Password</label>
            <input type="password" value="************" disabled />
            <button id='pass-chng-tn' onClick={handlePasswordChangeClick}>Change</button>
          </div>
        </div>

        {isPasswordVisible && (
          <div className="password-change-modal">
            <div className="modal-content">
              <button className="close-modal-btn" onClick={handleCloseModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
              <h2>Password Change</h2>
              {error && <p className="error-message">{error}</p>}
              <div className="input-group">
                <label>Old Password</label>
                <input
                  type="password"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Repeat New Password</label>
                <input
                  type="password"
                  placeholder="Repeat New Password"
                  value={repeatNewPassword}
                  onChange={(e) => setRepeatNewPassword(e.target.value)}
                />
              </div>
              <button className="save-password-btn" onClick={handleChangePassword}>SAVE PASSWORD</button>
            </div>
          </div>
        )}

        <div className="section notifications">
          <h2>Notifications</h2>
          <div className="toggle-grouptt">
            <span>Sales</span>
            <label className="switchttr">
              <input type="checkbox" checked />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="toggle-grouptt">
            <span>New arrivals</span>
            <label className="switchttr">
              <input type="checkbox" />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="toggle-grouptt">
            <span>Delivery status changes</span>
            <label className="switchttr">
              <input type="checkbox" />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
