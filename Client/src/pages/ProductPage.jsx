import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import { Rating } from '@mui/material';
import FlashMessageContext from '../components/FlashMessageContext';
import Skeleton from 'react-loading-skeleton';
import './css/ProductPage.css';

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState({ image: [] });
  
  const [mainImage, setMainImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeInfo, setShowSizeInfo] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flashMessage, setFlashMessage] = useState({ message: '', type: '' });
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token');

  // Debugging hook for when product ID changes
  useEffect(() => {

    const fetchProduct = async () => {
      try {
        const response = await api.get(`/api/product/${productId}`);
        const fetchedProduct = response.data;

        setProduct(fetchedProduct);

        // Set the first image or a placeholder
        const firstImage = fetchedProduct[0].image?.[0]?.img || 'https://via.placeholder.com/400';
        setMainImage(firstImage);
        fetchReviews(fetchedProduct[0].reviews);
        fetchRelatedProducts(fetchedProduct[0].category);
        document.title = `NexBuy - ${capitalizeFirstLetter(fetchedProduct[0].title)}`;
      } catch (error) {
        console.error('Error fetching product data:', error);  // Debugging error
        setFlashMessage({ message: error.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      document.title = 'NexBuy';
    };
  }, [productId]);

  // Capitalize product title
  function capitalizeFirstLetter(string) {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  }

  // Fetch reviews based on product
  useEffect(() => {
    if (product?.reviews) {
      fetchReviews(product[0].reviews);
    }
  }, [product]);

  const fetchRelatedProducts = async (category) => {
    try {
      const response = await api.get('/api/all-product');
      const allProducts = response.data;
      const relatedProducts = allProducts.filter(
        (lproduct) => lproduct.category === category && lproduct._id !== productId
      );
      setRelatedProducts(relatedProducts.slice(0, 5));
    } catch (error) {
      console.error('Error fetching related products:', error);  // Debugging error
      setFlashMessage({ message: 'Failed to load related products.', type: 'error' });
    }
  };


    
  const handleGoBack = () => navigate(-1);

  const handleShare = () => {
    const shareData = {
      title: product.title,
      text: `Check out this amazing product on NexBuy: ${product.title}`,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData)
        .then(() => setFlashMessage({ message: 'Product shared successfully!', type: 'success' }))
        .catch((error) => setFlashMessage({ message: `Failed to share: ${error.message}`, type: 'error' }));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => setFlashMessage({ message: 'Link copied to clipboard!', type: 'success' }))
        .catch((error) => setFlashMessage({ message: `Failed to copy link: ${error.message}`, type: 'error' }));
    }
  };

  const handleThumbnailClick = (image) => setMainImage(image);

  const handleSizeChange = (size) => setSelectedSize(size);
  const toggleSizeInfo = () => setShowSizeInfo((prev) => !prev);

  const fetchReviews = async (reviewIds) => {
    try {
      const reviewRequests = reviewIds.map((reviewId) => api.get(`/api/review/${reviewId}`));
      const responses = await Promise.all(reviewRequests);
      const fetchedReviews = responses.map((response) => response.data);
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      alert('Failed to fetch reviews.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/api/reviews/create', {
        rating: reviewRating,
        text: reviewText,
        product: productId,
      }, {
        headers: {
          'Authorization': `Bearer ${isAuthenticated}`,
        },
      });
      alert('Review submitted successfully');
      setReviewRating(0);
      setReviewText('');
      fetchReviews(product[0].reviews);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = async () => {
    setLoading(true); // Start loading state
    try {
      await api.post('/api/cart/add', {
        productId: product[0]._id,
        quantity: 1,
      }, {
        headers: {
          'Authorization': `Bearer ${isAuthenticated}`,
        },
      });
      setFlashMessage({ message: `Added ${product[0].title} to the cart`, type: 'success' });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add item to cart.';
      setFlashMessage({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false); // End loading state
    }
  };
  

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  const calculateSavings = (price) => {
    let discountRate;

    if (price <= 100) {
      discountRate = 0.02;
    } else if (price <= 1000) {
      discountRate = 0.05;
    } else if (price <= 10000) {
      discountRate = 0.1;
    } else if (price <= 100000) {
      discountRate = 0.15;
    } else if (price <= 300000) {
      discountRate = 0.2;
    } else {
      discountRate = 0.25;
    }

    const discountAmount = price * discountRate;
    const finalPrice = price - discountAmount;

    return { finalPrice, discountAmount };
  };

  const { finalPrice, discountAmount } = product ? calculateSavings(product.price) : { finalPrice: 0, discountAmount: 0 };

  return (
    <div>
      <Header />
      {loading ? (
        <div className="loading-skeleton">
          <Skeleton height={30} width={30} />
          <Skeleton height={30} width={150} />
          <Skeleton variant="rectangular" width="100%" height={400} />
          <Skeleton height={30} width="60%" />
          <Skeleton height={20} width="80%" />
          <Skeleton height={20} width="40%" />
          <Skeleton height={40} width="100%" />
        </div>
      ) : (
        <main>
          <FlashMessageContext
            message={flashMessage.message} 
            type={flashMessage.type} 
            onClose={() => setFlashMessage({ message: '', type: '' })} 
          />
          <div className="product-head">
            <span onClick={handleGoBack}><i className="fa-solid fa-chevron-left"></i></span>
            <span>{product.title}</span>
            <span onClick={handleShare}><i className="fa-solid fa-share"></i></span>
          </div>

          <div className="product-images">
            <div className="main-image">
              <img src={mainImage} alt={product.title} />
            </div>
            <div className="thumbnail-images">
              {Array.isArray(product[0].image) && product[0].image.length > 0 ? (
                product[0].image.map((image, index) => (
                  <img
                    key={index}
                    src={image.img}
                    alt={`${product.title} thumbnail ${index + 1}`}
                    onClick={() => handleThumbnailClick(image.img)}
                  />
                ))
              ) : (
                <p>No images available</p>
              )}
            </div>
          </div>

          <div className="product-details">
            <h2>{capitalizeFirstLetter(product[0].title)}</h2>
            <p className="description">{product[0].description}</p>
            <div className="rating">
              <Rating name="read-only" value={product[0].rating?.rate || 0} precision={0.1} readOnly />
              <span className="rating-count">({product[0].rating?.count || 0} reviews)</span>
            </div>
            <div className="price">
              <span className="final-price">{formatCurrency(product[0].price)}</span>
              {discountAmount > 0 && (
                <>
                  <span className="original-price">{formatCurrency(product[0].price)}</span>
                  <span className="savings">You save {formatCurrency(discountAmount)}</span>
                </>
              )}
            </div>
           
            <button onClick={handleAddToCart} className="add-to-cart-btn">
              Add to Cart
            </button>
          </div>

          <section className="related_products">
  <h3>Related Products</h3>
  <div className="related_products_list">
    {relatedProducts.map((relatedProduct) => (
      <div key={relatedProduct._id} className="related-product-card">
        <Link id='related_ll' to={`/product/${relatedProduct._id}`}>
          <img
            src={relatedProduct.image?.[0]?.img || 'https://via.placeholder.com/150'}
            alt={relatedProduct.title}
          />
          <p>{capitalizeFirstLetter(relatedProduct.title)}</p>
        </Link>
      </div>
    ))}
  </div>
</section>





         
<section className="product-reviews">
            <h3>Reviews</h3>
            <div className="review-list">
              {reviews.length > 0 ? reviews.map((review) => (
                <div key={review._id} className="review-item">
                  <Rating name="review-rating" value={review.rating} precision={0.5} readOnly />
                  <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
                  <p>{review.comment}</p>
                </div>
              )) : <p>No reviews yet.</p>}
            </div>
            <form onSubmit={handleReviewSubmit} className="review-form">
              <h4>Write a Review</h4>
              <Rating
                name="review-rating"
                value={reviewRating}
                onChange={(e, newValue) => setReviewRating(newValue)}
              />
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review here"
                required
              />
              <button type="submit" disabled={submitting}>Submit Review</button>
            </form>
          </section>
        </main>
      )}
    </div>
  );
};

export default ProductPage;
