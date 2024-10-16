import React from 'react';
import './css/ProductItemCard.css';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function ProductItemCard({ product }) {
  // Function to format currency in INR
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  // Function to truncate the title to a specific word limit
  const truncateTitle = (title, wordLimit) => {
    const words = title.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return title;
  };

  // Function to intelligently calculate savings based on the price
  const calculateSavings = (price) => {
    let discountRate;

    if (price <= 100) {
      discountRate = 0.02; // 2% discount for products up to ₹100
    } else if (price <= 1000) {
      discountRate = 0.05; // 5% discount for products up to ₹1,000
    } else if (price <= 10000) {
      discountRate = 0.1; // 10% discount for products up to ₹10,000
    } else if (price <= 100000) {
      discountRate = 0.15; // 15% discount for products up to ₹1,00,000
    } else if (price <= 300000) {
      discountRate = 0.2; // 20% discount for products up to ₹3,00,000
    } else {
      discountRate = 0.25; // 25% discount for products above ₹3,00,000
    }

    const discountAmount = price * discountRate;
    const finalPrice = price - discountAmount;

    return { finalPrice, discountAmount };
  };

  // Apply the discount and calculate the savings
  const { finalPrice, discountAmount } = calculateSavings(product.price);

  return (
    <Link to={`/product/${product._id}`} className='product-card'>
      <img src={product.image[0]?.img} alt={product.title} /> 
      <h3>{truncateTitle(product.title, 7) || <Skeleton/>}</h3> {/* Limit to 6-7 words */}

      <div id='product-price'>
        <h4>{formatCurrency(finalPrice)}</h4> {/* Display the discounted price */}
      </div>

      <span>Save - {formatCurrency(discountAmount)}</span> {/* Display the savings amount */}
    </Link>
  );
}
