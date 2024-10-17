import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Header from '../components/Header.jsx';
import { Navigate } from 'react-router-dom';
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';
import './css/PaymentMethodsPage.css';
import api from '../api.js';

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // New state to manage loading
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardInfo, setCardInfo] = useState({
    cvc: '',
    expiry: '',
    focus: '',
    name: '',
    number: '',
    setDefault: false
  });
  const [defaultCardNumber, setDefaultCardNumber] = useState(null);
  const [error, setError] = useState(null);
  const isAuthenticated = localStorage.getItem('token');
  const userId = '66d3e94f8a05052f502d4562'; // Replace with dynamic user ID if needed

  useEffect(() => {
    if (isAuthenticated) {
      api.get(`/api/users/${userId}/payment-methods`, {
        headers: { Authorization: `Bearer ${isAuthenticated}` }
      })
      .then(response => {
        setPaymentMethods(response.data.payment_methods);
        const defaultMethod = response.data.payment_methods.find(method => method.default_payment_method);
        if (defaultMethod) setDefaultCardNumber(defaultMethod.card_number);
        setIsLoading(false); // Stop loading when data is fetched
      })
      .catch(error => {
        console.error('Error fetching payment methods:', error);
        setError('Error fetching payment methods');
        setIsLoading(false); // Stop loading even if there's an error
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
    const newCard = { ...cardInfo, default_payment_method: cardInfo.setDefault };
    api.post(`/api/users/${userId}/payment-methods`, newCard, {
      headers: { Authorization: `Bearer ${isAuthenticated}` }
    })
    .then(response => {
      setPaymentMethods(prevMethods => [...prevMethods, response.data]);
      setCardInfo({
        cvc: '',
        expiry: '',
        focus: '',
        name: '',
        number: '',
        setDefault: false
      });
      setShowAddCard(false);
    })
    .catch(error => {
      console.error('Error adding new card:', error);
      setError('Error adding new card');
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCardInfo(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleInputFocus = (e) => {
    setCardInfo(prevState => ({ ...prevState, focus: e.target.name }));
  };

  return (
    <div className="payment-methods-page">
      <Header />
      <div className="payment-methods-container">
        <h1>Payment Methods</h1>
        {error && <p className="error-message">{error}</p>}
        <div className="payment-methods-list">
          {isLoading ? (
            // Show skeleton loaders while data is being fetched
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
                  <Cards
                    cvc={method.cvv || ''}
                    expiry={method.expiry_date || ''}
                    focused={cardInfo.focus}
                    name={method.card_name || ''}
                    number={method.card_number || ''}
                  />
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
            <Cards
              cvc={cardInfo.cvc || ''}
              expiry={cardInfo.expiry || ''}
              focused={cardInfo.focus}
              name={cardInfo.name || ''}
              number={cardInfo.number || ''}
            />
            <form style={{ marginTop: '0.5rem' }}>
              <input
                type="text"
                name="name"
                placeholder="Name on card"
                value={cardInfo.name}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
              />
              <input
                type="tel"
                name="number"
                placeholder="Card number"
                value={cardInfo.number}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
              />
              <input
                type="text"
                name="expiry"
                placeholder="Expire Date"
                value={cardInfo.expiry}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
              />
              <input
                type="tel"
                name="cvc"
                placeholder="CVV"
                value={cardInfo.cvc}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
              />
              <div className="set-default-payment">
                <input
                  type="checkbox"
                  name="setDefault"
                  checked={cardInfo.setDefault}
                  onChange={handleInputChange}
                />
                <label htmlFor="setDefault">Set as default payment method</label>
              </div>
              <button type="button" onClick={handleAddCard} className="add-card-btn">ADD CARD</button>
              <button type="button" onClick={() => setShowAddCard(false)} className="cancel-btn">Cancel</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
