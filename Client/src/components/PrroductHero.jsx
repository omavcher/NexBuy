import React, { useState, useEffect } from 'react';
import './css/PrroductHero.css';
import ProductItemCard from './ProductItemCard';
import api from '../api.js';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';

export default function PrroductHero({ category }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await api.get('/api/all-product');
        const allProducts = response.data;

        // Filter products based on the category prop
        const filteredProducts = allProducts.filter(
          (product) => product.category === category
        );

        // Shuffle the filtered products
        const shuffledProducts = filteredProducts.sort(() => 0.5 - Math.random());

        // Limit to 5 random products
        const limitedProducts = shuffledProducts.slice(0, 5);

        setProducts(limitedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    getProducts();
  }, [category]);

  const capitalizeWords = (str) => {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className='prroducthero-container'>
      <div className='prroducthero-heading'>
        {loading ? (
          <Skeleton width={300} height={30} />
        ) : (
          <h2>Grab the best deal on <span>{capitalizeWords(category)}</span></h2>
        )}
        {!loading && (
          <Link to={`/catagory/${category}`} className='viewall-btn'>
            View All <i className="fa-solid fa-caret-right"></i>
          </Link>
        )}
      </div>

      <div className='product-item-card'>
        {loading
          ? Array(5).fill().map((_, index) => (
              <div key={index} className="skeleton-wrapper">
                <Skeleton height={300} width={200} />
                <Skeleton width={150} />
                <Skeleton width={100} />
              </div>
            ))
          : products.map((product) => (
              <ProductItemCard
                key={product._id}
                product={product}
              />
            ))}
      </div>
    </div>
  );
}
