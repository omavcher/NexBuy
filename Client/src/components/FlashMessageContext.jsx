import React, { useEffect } from 'react';
import './css/FlashMessageContext.css';

const FlashMessageContext = ({ message, type, onClose }) => {
  if (!message) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 5000); // Auto-hide after 5 seconds

    return () => clearTimeout(timer); // Clear timer if component unmounts
  }, [message, onClose]);

  return (
    <div id="container">
      {type === 'success' ? (
        <div id="success-box">
          <div className="dot" onClick={onClose}></div>
          <div className="dot two" onClick={onClose}></div>
          <div className="face">
            <div className="eye"></div>
            <div className="eye right"></div>
            <div className="mouth happy"></div>
          </div>
          <div className="shadow scale"></div>
          <div className="message">
            <h1 className="alert">Success!</h1>
            <p>{message}</p>
          </div>
          <button className="button-box" onClick={onClose}>
            <h1 className="green">Continue</h1>
          </button>
        </div>
      ) : (
        <div id="error-box">
          <div className="dot"></div>
          <div className="dot two" onClick={onClose}></div>
          <div className="face2">
            <div className="eye"></div>
            <div className="eye right"></div>
            <div className="mouth sad"></div>
          </div>
          <div className="shadow move"></div>
          <div className="message">
            <h1 className="alert">Error!</h1>
            <p>{message}</p>
          </div>
          <button className="button-box" onClick={onClose}>
            <h1 className="red">Try Again</h1>
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashMessageContext;
