import React, { useState } from 'react';
import './css/DefaultProduct.css';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import { useNavigate } from 'react-router-dom';
import FlashMessageContext from './FlashMessageContext';

// Function to format currency in INR
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
};

// Function to truncate the title to 3-6 words
const truncateTitle = (title, minWords = 3, maxWords = 4) => {
  const words = title.split(' ');
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...';
  }
  return words.slice(0, Math.max(words.length, minWords)).join(' ');
};

// Function to intelligently apply discount based on the original price
const applyDiscount = (price) => {
  let discountRate;

  if (price < 1000) {
    discountRate = 0.05; // 5% discount for items below ₹1,000
  } else if (price < 5000) {
    discountRate = 0.1; // 10% discount for items between ₹1,000 and ₹5,000
  } else {
    discountRate = 0.15; // 15% discount for items above ₹5,000
  }

  const discountAmount = price * discountRate;
  const discountedPrice = price - discountAmount;
  
  return { discountedPrice, discountAmount, discountRate };
};

export default function DefaultProduct({ product }) {
  const [flashMessage, setFlashMessage] = useState({ message: '', type: '' });
  const navigate = useNavigate(); // Hook to handle navigation

  // Calculate discounted price using the intelligent discount function
  const { discountedPrice, discountAmount, discountRate } = applyDiscount(product.price);

  // Handler for the like button click
  const handleLikeClick = (event) => {
    event.stopPropagation(); // Stop the click event from affecting navigation
    console.log('Product liked!');
    setFlashMessage({ message: 'Product liked!', type: 'success' });
  };

  // Handler for the card click
  const handleCardClick = () => {
    console.log('Product clicked:', product); // Debug product click
    navigate(`/product/${product._id}`);
  };

  return (
    <div className='dproduct-card' onClick={handleCardClick}>
      <img 
  src={product.image && product.image.length > 0 ? product.image[0].img : '/path/to/fallback/image.jpg'} 
  alt={product.title} 
  className='product-imagei'

/>
      <div className='rating-section'>
        <Stack spacing={1} alignItems="center">
          <Rating 
            style={{ color: "red" }} 
            disabled 
            name="read-only"
            value={product.rating.rate} // Use value instead of defaultValue
            size="small" 
          />
        </Stack>
      </div>
      <div className='product-info' style={{gap:"0"}}>
        <p className='brand-name'>{product.brand}</p>
        <h1 className='product-name'>{truncateTitle(product.title)}</h1> {/* Truncate the title */}
        <div className='price-section'>
          <p className='discounted-price'>{formatCurrency(discountedPrice)}</p>
          <h3 className='original-price'>{formatCurrency(product.price)}</h3>
          <Box sx={{ position: 'relative' }}>
            <Fab
              aria-label="like"
              className='favorite-button'
              style={{ backgroundColor: 'red', color: 'white', zIndex: 5 }} // Customize as needed
              size="small"
              onClick={handleLikeClick} // Add the click handler
            >
              <FavoriteIcon />
            </Fab>
          </Box>
        </div>
      </div>
      {/* Include the FlashMessageContext component */}
      <FlashMessageContext
        message={flashMessage.message}
        type={flashMessage.type}
        onClose={() => setFlashMessage({ message: '', type: '' })}
      />
    </div>
  );
}
