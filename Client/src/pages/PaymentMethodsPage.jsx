import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Header from '../components/Header.jsx';
import { Navigate } from 'react-router-dom';
import { usePaymentInputs, PaymentInputsContainer } from 'react-payment-inputs';
import images from 'react-payment-inputs/images';
import './css/PaymentMethodsPage.css';
import api from '../api.js';

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [defaultCardNumber, setDefaultCardNumber] = useState(null);
  const [error, setError] = useState(null);
  const isAuthenticated = localStorage.getItem('token');
  const userId = '66d3e94f8a05052f502d4562'; // Replace with dynamic user ID if needed

  const {
    meta,
    getCardNumberProps,
    getExpiryDateProps,
    getCvcProps,
    getCardImageProps,
  } = usePaymentInputs();

  useEffect(() => {
    if (isAuthenticated) {
      api.get(`/api/users/${userId}/payment-methods`, {
        headers: { Authorization: `Bearer ${isAuthenticated}` }
      })
      .then(response => {
        setPaymentMethods(response.data.payment_methods);
        const defaultMethod = response.data.payment_methods.find(method => method.default_payment_method);
        if (defaultMethod) setDefaultCardNumber(defaultMethod.card_number);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching payment methods:', error);
        setError('Error fetching payment methods');
        setIsLoading(false);
      });
    }
  }, [isAuthenticated, userId]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleDefaultChange = (cardNumber) => {
    api.patch(`/api/users/${userId}/payment-methods/${cardNumber}/default`, null, {
      headers: { Authorization: `Bearer ${isAuthenticated}` }
    })
    .then(() => {
      setDefaultCardNumber(cardNumber);
      setPaymentMethods(prevMethods =>
        prevMethods.map(method =>
          method.card_number === cardNumber
            ? { ...method, default_payment_method: true }
            : { ...method, default_payment_method: false }
        )
      );
    })
    .catch(error => {
      console.error('Error updating default payment method:', error);
      setError('Error updating default payment method');
    });
  };

  const handleAddCard = () => {
    const newCard = {
      number: meta.cardNumber.value,
      expiry: meta.expiryDate.value,
      cvc: meta.cvc.value,
      default_payment_method: meta.setDefault
    };

    api.post(`/api/users/${userId}/payment-methods`, newCard, {
      headers: { Authorization: `Bearer ${isAuthenticated}` }
    })
    .then(response => {
      setPaymentMethods(prevMethods => [...prevMethods, response.data]);
      setShowAddCard(false);
    })
    .catch(error => {
      console.error('Error adding new card:', error);
      setError('Error adding new card');
    });
  };

  return (
    <div className="payment-methods-page">
      <Header />
      <div className="payment-methods-container">
        <h1>Payment Methods</h1>
        {error && <p className="error-message">{error}</p>}
        <div className="payment-methods-list">
          {isLoading ? (
            Array(3).fill().map((_, index) => (
              <div key={index} className="payment-method-card">
                <Skeleton height={200} width={300} />
                <div className="default-payment">
                  <Skeleton height={20} width={200} />
                </div>
              </div>
            ))
          ) : (
            paymentMethods.map((method) => (
              <div key={method.card_number} className={`payment-method-card ${method.default_payment_method ? 'default' : ''}`}>
                <div className="card-details">
                  <img {...getCardImageProps({ images })} alt="Card Type" />
                  <div>{method.card_number}</div>
                </div>
                <div className="default-payment">
                  <input
                    type="radio"
                    checked={method.default_payment_method}
                    onChange={() => handleDefaultChange(method.card_number)}
                  />
                  <span>Use as default payment method</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="add-card">
          <button onClick={() => setShowAddCard(true)} className="add-card-button">
            +
          </button>
        </div>

        {showAddCard && (
          <div className="add-card-form">
            <h2>Add a New Card</h2>
            <PaymentInputsContainer>
              <div className="card-inputs">
                <input {...getCardNumberProps()} placeholder="Card number" />
                <input {...getExpiryDateProps()} placeholder="MM/YY" />
                <input {...getCvcProps()} placeholder="CVC" />
              </div>
              {meta.isTouched && meta.error && <span>{meta.error}</span>}
            </PaymentInputsContainer>
            <button type="button" onClick={handleAddCard} className="add-card-btn">ADD CARD</button>
            <button type="button" onClick={() => setShowAddCard(false)} className="cancel-btn">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
