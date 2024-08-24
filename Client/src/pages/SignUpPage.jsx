import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/SignUpPage.css';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api from '../api'; 

export default function SignUpPage() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    password: false,
    mobile: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormValues({ ...formValues, [id]: value });
  };

  const handleBlur = (e) => {
    const { id, value } = e.target;
    validateField(id, value);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const validateField = (fieldName, value) => {
    let error = false;
    switch (fieldName) {
      case 'name':
        error = value.trim() === '';
        break;
      case 'email':
        error = !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
        break;
      case 'password':
        error = value.length < 6;
        break;
      case 'mobile':
        error = !/^\d{10}$/.test(value);
        break;
      default:
        break;
    }
    setFormErrors(prevErrors => ({ ...prevErrors, [fieldName]: error }));
  };

  const validateForm = () => {
    let errors = {};
    errors.name = formValues.name.trim() === '';
    errors.email = !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formValues.email);
    errors.password = formValues.password.length < 6;
    errors.mobile = !/^\d{10}$/.test(formValues.mobile);

    setFormErrors(errors);
    return !Object.values(errors).some(error => error === true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      api.post('/api/sign-up', formValues) 
        .then(response => {
          console.log('Form Submitted:', response.data);
          navigate('/success');
        })
        .catch(error => {
          console.error('Error submitting form:', error);
        });
    } else {
      console.log('Form has errors.');
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="signup-container">
      <header className="signup-header">
        <i className="fa-solid fa-chevron-left" onClick={goBack}></i>
        <h1>Sign Up</h1>
      </header>
      <main className="signup-form">
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
            id="name"
            label="Name"
            variant="outlined"
            value={formValues.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={formErrors.name}
            helperText={formErrors.name ? "Name is required." : ""}
            fullWidth
          />
          <TextField
            id="email"
            label="Email"
            type="email"
            variant="outlined"
            value={formValues.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={formErrors.email}
            helperText={formErrors.email ? "Enter a valid email address." : ""}
            fullWidth
          />
          <FormControl
            variant="outlined"
            sx={{ m: 1, width: '100%' }}
            error={formErrors.password}
          >
            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
            <OutlinedInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formValues.password}
              onChange={handleChange}
              onBlur={handleBlur}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
            {formErrors.password && (
              <FormHelperText>Password must be at least 6 characters.</FormHelperText>
            )}
          </FormControl>
          <TextField
            id="mobile"
            label="Mobile"
            type="tel"
            variant="outlined"
            value={formValues.mobile}
            onChange={handleChange}
            onBlur={handleBlur}
            error={formErrors.mobile}
            helperText={formErrors.mobile ? "Enter a valid 10-digit mobile number." : ""}
            fullWidth
          />
          <Link to='/signin' className='have-acc-div'>
            <p>Already have an account?</p>
            <img src='./round-arrow_right.png' alt='Arrow' />
          </Link>

          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2, width: '100%' }}
            type="submit"
          >
            Sign Up
          </Button>
        </Box>

        <div className='auth-container'>
          <p>Or sign up with social account</p>

          <div className='auth-images'>
            <Link to='/google-auth' id='google-auth'>
              <img src='/google.png' alt='Google' />
            </Link>

            <Link to='/facebook-auth' id='facebook-auth'>
              <img src='/facebook.png' alt='Facebook' />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
