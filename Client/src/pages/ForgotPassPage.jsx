import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './css/SignUpPage.css';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import api from '../api';

export default function ForgotPassPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);

  useEffect(() => {
    document.title = 'NexBuy - Forgot Password';
    return () => {
      document.title = 'NexBuy';
    };
  }, []);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleBlur = () => {
    setEmailError(!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email));
  };

  const validateForm = () => {
    return !emailError && email.trim() !== '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      api.post('/api/forgot-password', { email })
        .then(response => {
          console.log('Password reset email sent:', response.data);
          navigate('/check-email');
        })
        .catch(error => {
          console.error('Error sending password reset email:', error);
        });
    } else {
      console.log('Invalid email.');
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="signup-container">
      <header className="signup-header">
        <i className="fa-solid fa-chevron-left" onClick={goBack}></i>
        <h1>Forgot Password</h1>
      </header>
      <main className="signup-form">
        <p>Please, enter your email address. You will receive a link to create a new password via email.</p>
        <Box
          component="form"
          sx={{
            '& .MuiTextField-root': { m: 1, width: '100%' },
            maxWidth: '500px',
            margin: '0 auto',
          }}
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <TextField
            id="email"
            label="Email"
            type="email"
            variant="outlined"
            value={email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={emailError}
            helperText={emailError ? "Enter a valid email address." : ""}
            fullWidth
          />
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2, width: '100%' }}
            type="submit"
          >
            Reset Password
          </Button>
        </Box>
      </main>
    </div>
  );
}
