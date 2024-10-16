import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import './css/JoinBusinessPage.css';
import { Navigate } from 'react-router-dom';
import api from '../api.js';

export default function JoinBusinessPage() {
    const isAuthenticated = localStorage.getItem('token');
    const accountType = localStorage.getItem('account_type'); // Check account type
    const [formData, setFormData] = useState({
        business_name: '',
        email: '',
        phone_number: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [redirectTo, setRedirectTo] = useState(null);

    // Redirect if user is authenticated and account type is business
    if (isAuthenticated && accountType === 'business') {
        return <Navigate to="/business/dashboard" />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post('/api/register-business', formData, {
                headers: {
                    'Authorization': `Bearer ${isAuthenticated}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                localStorage.setItem('account_type', 'business');
                setRedirectTo('/business/dashboard');
            }
        } catch (error) {
            setError('Error registering business: ' + (error.response?.data?.message || error.message));
        }
    };

    if (redirectTo) {
        return <Navigate to={redirectTo} />;
    }

    return (
        <div className="join-business-page">
            <Header />

            <div className="join-form-container">
                <h1>Join Our Business Platform</h1>
                <p>To become a registered seller, please fill in the form below with accurate details.</p>
                
                <form onSubmit={handleRegister} className="join-form">
                    <div className="input-group">
                        <label>Business Name</label>
                        <input
                            type="text"
                            name="business_name"
                            value={formData.business_name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="register-btn">Register</button>
                </form>
            </div>
        </div>
    );
}
