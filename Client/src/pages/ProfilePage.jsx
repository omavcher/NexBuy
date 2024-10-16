import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Include the default styling
import './css/ProfilePage.css';
import Header from '../components/Header.jsx';
import api from '../api'; // Assuming you have an axios instance configured

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token');
  const locationId = 'profile-page'; 

  useEffect(() => {
    document.title = 'NexBuy - Profile';
    return () => {
      document.title = 'NexBuy';
    };
  }, []);

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

  const goBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    localStorage.removeItem('account_type')
    localStorage.removeItem('token');
    navigate('/login');
  };

  const formatCardNumber = (cardNumber) => {
    return cardNumber.slice(-4); // Show only the last 4 digits
  };

  const getDefaultPaymentMethod = (paymentMethods) => {
    return paymentMethods.find(method => method.default_payment_method) || {};
  };

  const defaultPaymentMethod = user?.payment_methods ? getDefaultPaymentMethod(user.payment_methods) : {};

  return (
    <div className="profile-page">
      <Header />
      <header className="profile-header">
        <i className="fa-solid fa-chevron-left" onClick={goBack}></i>
        <h1>My Profile</h1>
      </header>
      <main>
        {loading ? (
          <div className="skeleton-wrapper">
            <Skeleton height={30} width={200} style={{ margin: '20px 0' }} />
            <Skeleton height={20} width={250} />
            <Skeleton count={5} height={40} style={{ margin: '20px 0' }} />
          </div>
        ) : user ? (
          <>
            <div className="profile-info-container">
              <div className="profile-info-box">
                <h1>{user.name}</h1>
                <p>{user.email}</p>
              </div>
            </div>

            <section className="profile-options-container">
              <Link className="profile-option" to="/orders">
                <div className="profile-option-details">
                  <h3>My Orders</h3>
                  <p>
                    {user.account_type === 'business' 
                      ? `Already have ${user.orders?.length || 0} orders` 
                      : user.orders?.length > 0 
                        ? `Already have ${user.orders.length} orders` 
                        : 'Place your first order'}
                  </p>
                </div>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>

              <Link className="profile-option" to="/addresses">
                <div className="profile-option-details">
                  <h3>Shipping Addresses</h3>
                  <p>
                    {user.shipping_add?.length > 0
                      ? `${user.shipping_add.length} addresses`
                      : 'Add address'}
                  </p>
                </div>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>

              <Link className="profile-option" to="/payment-methods">
                <div className="profile-option-details">
                  <h3>Payment Methods</h3>
                  <p>
                    {user.payment_methods?.length > 0
                      ? `Visa **${formatCardNumber(defaultPaymentMethod.card_number)}`
                      : 'Add payment method'}
                  </p>
                </div>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>

              <Link className="profile-option" to="/reviews">
                <div className="profile-option-details">
                  <h3>My Reviews</h3>
                  <p>
                    {user.reviews?.length > 0
                      ? `Reviews for ${user.reviews.length} items`
                      : 'Add your first review'}
                  </p>
                </div>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>

              <Link className="profile-option" to="/settings">
                <div className="profile-option-details">
                  <h3>Settings</h3>
                  <p>Notifications, password</p>
                </div>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>

              <Link className="profile-option business-ac" to="/business">
                <div className="profile-option-details">
                  <h3>Join Business Account</h3>
                  <p>{user.account_type === 'business' ? `Already have ${user.orders?.length || 0} orders` : ''}</p>
                </div>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </section>

            <button className="logout-button" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <div>User not found</div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
