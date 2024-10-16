// App.jsx
import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Header from './components/Header';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import ForgotPassPage from './pages/ForgotPassPage';
import SubCatagoey from './pages/SubCatagoey';
import CategoryPage from './pages/CategoryPage';
import BrandPage from './pages/BrandPage';
import ProfilePage from './pages/ProfilePage';
import PrivateRoute from './components/PrivateRoute'; 
import OrderPage from './pages/OrderPage';
import AddresPage from './pages/AddresPage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import MyReviewsPage from './pages/MyReviewsPage';
import SettingsPage from './pages/SettingsPage';
import JoinBusinessPage from './pages/JoinBusinessPage';
import Cart from './pages/Cart';
import CheckoutPage from './pages/CheckoutPage';
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
import OrderDetailPage from './pages/OrderDetailPage';
import Dashboard from './pages/DashboArd';
import BusinessOwnerProductDetailPage from './pages/BusinessOwnerProductDetailPage.jsX';

const theme = createTheme({
  // Customize your theme here
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forget-pass" element={<ForgotPassPage />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/catagory/:category" element={<CategoryPage />} />
            <Route path="/catagory/:category/:subcategory" element={<SubCatagoey />} />
            <Route path="/brand/:brand" element={<BrandPage />} />
            <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
            <Route path="/orders" element={<PrivateRoute element={<OrderPage />} />} />
            <Route path="/addresses" element={<PrivateRoute element={<AddresPage />} />} />
            <Route path="/payment-methods" element={<PrivateRoute element={<PaymentMethodsPage />} />} />
            <Route path="/reviews" element={<PrivateRoute element={<MyReviewsPage />} />} />
            <Route path="/settings" element={<PrivateRoute element={<SettingsPage />} />} />
            <Route path="/business" element={<PrivateRoute element={<JoinBusinessPage />} />} />
            <Route path="/cart" element={<PrivateRoute element={<Cart />} />} />
            <Route path="/checkout" element={<PrivateRoute element={<CheckoutPage />} />} />
            <Route path="/orders/detail/:orderedId" element={<PrivateRoute element={<OrderDetailPage />} />} />
            <Route path="/business/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
            <Route path="/business/manage-order/:orderedId" element={<PrivateRoute element={<BusinessOwnerProductDetailPage />} />} />
          </Routes>
        </Suspense>
      </main>
    </ThemeProvider>
  );
};

export default App;