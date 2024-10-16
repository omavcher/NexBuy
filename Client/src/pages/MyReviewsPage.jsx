import React, { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import { Navigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import api from '../api.js';
import './css/MyReviewsPage.css';
import Rating from '@mui/material/Rating'; // Ensure this is imported

export default function MyReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All'); // To handle the filter logic
    const isAuthenticated = localStorage.getItem('token');

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await api.get('/api/reviews', {
                    headers: {
                        'Authorization': `Bearer ${isAuthenticated}`,
                    }
                });

                const reviewIds = response.data.reviews;
                if (Array.isArray(reviewIds)) {
                    // Fetch detailed reviews and corresponding products
                    const detailedReviews = await Promise.all(
                        reviewIds.map(async (id) => {
                            try {
                                const detailedResponse = await api.get(`/api/review/${id}`, {
                                    headers: {
                                        'Authorization': `Bearer ${isAuthenticated}`,
                                    }
                                });

                                const reviewData = detailedResponse.data;
                                // Fetch product data based on productId
                                const productResponse = await api.get(`/api/product/${reviewData.productId}`, {
                                    headers: {
                                        'Authorization': `Bearer ${isAuthenticated}`,
                                    }
                                });

                                return {
                                    ...reviewData,
                                    product: productResponse.data, // Attach the product data
                                };
                            } catch (error) {
                                console.error(`Error fetching review or product details for ID: ${id}`, error);
                                return null;
                            }
                        })
                    );

                    setReviews(detailedReviews.filter(review => review !== null));
                } else {
                    console.error('Unexpected data format:', response.data);
                    setReviews([]);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching reviews:', error);
                setReviews([]);
                setLoading(false);
            }
        };

        fetchReviews();
    }, [isAuthenticated]);

    const handleDelete = async (reviewId) => {
        try {
            await api.delete(`/api/reviews/${reviewId}`, {
                headers: {
                    'Authorization': `Bearer ${isAuthenticated}`,
                }
            });
            setReviews(reviews.filter(review => review._id !== reviewId));
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const handleEdit = async (reviewId, updatedReview) => {
        try {
            await api.put(`/api/reviews/${reviewId}`, updatedReview, {
                headers: {
                    'Authorization': `Bearer ${isAuthenticated}`,
                }
            });
            setReviews(reviews.map(review => 
                review._id === reviewId ? { ...review, ...updatedReview } : review
            ));
        } catch (error) {
            console.error('Error updating review:', error);
        }
    };

    const filteredReviews = reviews.filter((review) => {
        if (filter === 'Positive') return review.rating >= 4;
        if (filter === 'Negative') return review.rating <= 2;
        return true;
    });

    return (
        <div className="my-reviews-page">
            <Header />
            <div className="reviews-container">
                <div className="filter-bar">
                    <button 
                        className={`filter-btn ${filter === 'All' ? 'active' : ''}`}
                        onClick={() => setFilter('All')}
                    >
                        All
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'Positive' ? 'active' : ''}`}
                        onClick={() => setFilter('Positive')}
                    >
                        Positive
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'Negative' ? 'active' : ''}`}
                        onClick={() => setFilter('Negative')}
                    >
                        Negative
                    </button>
                </div>
                <div className="reviews-list">
                    {loading ? (
                        Array(3).fill().map((_, index) => (
                            <div className="review-card" key={index}>
                                <Skeleton height={150} />
                            </div>
                        ))
                    ) : (
                        filteredReviews.length > 0 ? (
                            filteredReviews.map((review) => (
                                <div className="review-card" key={review._id}>
                                    <div className="product-info">
                                        <img src={review.product[0].image[0].img} alt={review.product.name} className="product-image"/>
                                        <div>
                                            <h3>{review.product[0].title}</h3>
                                            <p>{new Date(review.updatedAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="review-content">
                                        <Rating name="review-rating" value={review.rating} precision={0.5} readOnly />
                                        <p>{review.comment}</p>
                                    </div>
                                    <div className="review-actions">
                                        <button className="edit-btn" onClick={() => handleEdit(review._id, { ...review, comment: 'Updated comment' })}>Edit</button>
                                        <button className="delete-btn" onClick={() => handleDelete(review._id)}>Delete</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No reviews found.</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
