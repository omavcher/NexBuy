import React from 'react';
import { Navigate } from 'react-router-dom';

// A hook to check authentication status
const useAuth = () => {
  const token = localStorage.getItem('token');
  return !!token; // Returns true if token exists, false otherwise
};

const PrivateRoute = ({ element: Component, ...rest }) => {
  const isAuthenticated = useAuth();

  return isAuthenticated ? Component : <Navigate to="/login" />;
};

export default PrivateRoute;