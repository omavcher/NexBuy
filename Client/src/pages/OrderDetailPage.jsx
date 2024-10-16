import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import './css/OrderDetailPage.css';
import Header from '../components/Header';
import api from '../api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function OrderDetailPage() {
    const { orderedId } = useParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [detailedProducts, setDetailedProducts] = useState([]);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackStatus, setFeedbackStatus] = useState(''); // New state for feedback status
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [userDetails, setUserDetails] = useState(null);
    const isAuthenticated = localStorage.getItem('token');

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        if (isAuthenticated) {
            api.get(`/api/users/orders/detail/${orderedId}`, {
                headers: { Authorization: `Bearer ${isAuthenticated}` }
            })
            .then(response => {
                setOrderDetails(response.data);
                fetchProductDetails(response.data.order_products);
            })
            .catch(error => {
                console.error('Error fetching order details:', error);
                setError('Error fetching order details');
                setIsLoading(false); 
            });

            api.get('/api/user-details', {
                headers: { Authorization: `Bearer ${isAuthenticated}` }
            })
            .then(response => {
                setUserDetails(response.data);
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
                setError('Error fetching user details');
                setIsLoading(false); 
            });
        }
    }, [isAuthenticated, orderedId]);

    const fetchProductDetails = async (orderProducts) => {
        try {
            const productDetailsPromises = orderProducts.map(async (product) => {
                const response = await api.get(`/api/product/${product.product_id}`);
                return {
                    ...response.data,
                    quantity: product.quantity
                };
            });

            const products = await Promise.all(productDetailsPromises);
            setDetailedProducts(products);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching product details:', error);
            setError('Error fetching product details');
            setIsLoading(false);
        }
    };

    const goBack = () => {
        window.history.back();
    };

    const toggleFeedback = () => {
        if (isFeedbackOpen && feedbackStatus === 'Feedback submitted successfully!') {
            setFeedbackStatus('');
        }
        setIsFeedbackOpen(!isFeedbackOpen);
    };

    const handleFeedbackSubmit = () => {
        if (!feedbackText.trim()) {
            setFeedbackStatus('Feedback cannot be empty');
            return;
        }
    
        api.post('/api/feedback', 
            { feedbackText, orderId: orderedId }, // Sending both feedbackText and orderId
            {
                headers: { Authorization: `Bearer ${isAuthenticated}` }
            }
        )
        .then(() => {
            setFeedbackStatus('Feedback submitted successfully!');
            setFeedbackText(''); // Clear feedback textarea
            toggleFeedback(); // Close feedback panel
        })
        .catch(error => {
            console.error('Error submitting feedback:', error);
            setFeedbackStatus('Error submitting feedback');
        });
    };
    

    if (isLoading) {
        return (
            <div className="order-detail-page">
                <Header />
                <header className="cart-header">
                    <i className="fa-solid fa-chevron-left" onClick={goBack}></i>
                    <h1>Order Details</h1>
                </header>

                <main className="order-details">
                    {/* Skeleton Loading for Order Details */}
                    <div className="order-detail-info-hero-container">
                        <Skeleton height={30} width={200} />
                        <Skeleton height={30} width={150} />
                        <Skeleton height={30} width={100} />
                    </div>

                    {/* Skeleton Loading for Cart Content */}
                    <div className="cart-content">
                        {Array(3).fill().map((_, index) => (
                            <div className="cart-item-container" key={index}>
                                <Skeleton height={150} width={150} />
                                <div className="cart-item-info">
                                    <div className="cart-item-header">
                                        <Skeleton height={20} width={200} />
                                        <Skeleton height={20} width={100} />
                                    </div>
                                    <div className="cart-item-footer">
                                        <Skeleton height={20} width={100} />
                                        <Skeleton height={20} width={100} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Skeleton Loading for Order Information */}
                    <div className="order-detail-container">
                        <Skeleton height={30} width={200} />
                        <Skeleton height={20} width={300} />
                        <Skeleton height={20} width={300} />
                        <Skeleton height={20} width={200} />
                        <Skeleton height={20} width={150} />
                        <Skeleton height={40} width={150} />
                    </div>
                </main>
            </div>
        );
    }


    if (error) {
        return <div>{error}</div>;
    }

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
      
        return { finalPrice, discountAmount, discountRate: discountRate * 100 };
    };

    const shippingAddress = userDetails?.shipping_add?.find(addr => addr.default_address) || {};
    const paymentMethod = userDetails?.payment_methods?.find(method => method.default_payment_method) || {};

    return (
        <div className="order-detail-page">
            <Header />
            <header className="cart-header">
                <i className="fa-solid fa-chevron-left" onClick={goBack}></i>
                <h1>Order Details</h1>
            </header>

            <main className="order-details">
                {orderDetails && (
                    <>
                        {/* Order Details Section */}
                        <div className='order-detail-info-hero-container'>
                            <div className='order-detail-info-first-hero-container'>
                                <span><h5>Order No: {orderDetails.order_no}</h5></span>
                                <span><p>{new Date(orderDetails.order_date).toLocaleDateString()}</p></span>
                            </div>
                            <div className='order-detail-info-first-hero-container'>
                                <span><h5>Tracking number: {orderDetails.tracking_id}</h5></span>
                                <span><p id='delivered'>Processing</p></span>
                            </div>
                            <div className='order-detail-info-first-hero-container'>
                                <span><h5>{orderDetails.order_products.length} items</h5></span>
                            </div>
                        </div>

                        <div className="cart-content">
    {detailedProducts.length > 0 ? detailedProducts.map(productObj => {
        const product = productObj[0]; 
        const price = product.price || 0; 
        const total = price * productObj.quantity;
        return (
            <div className="cart-item-container" key={product._id}>
                <img src={product.image?.[0]?.img || '/path/to/fallback/image.jpg'} alt={product.title} />
                <div className="cart-item-info">
                    <div className="cart-item-header">
                        <div className="cart-item-details">
                            <h1>{product.title}</h1>
                            <span>Price: ₹{price.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                    <div className="cart-item-footer">
                        <div className="cart-quantity-container">
                            <h3>Units: {productObj.quantity}</h3> {/* Adjusted to access quantity correctly */}
                        </div>
                        <div className="cart-price">
                            <p>Total: ₹{total.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }) : <div>No products found.</div>}
</div>


                        {/* Order Information Section */}
                        <div className="order-detail-container">
                            <h2>Order Information</h2>
                            <div className="order-detail-item">
                                <span className="order-detail-label">Shipping Address:</span>
                                <span>{`${shippingAddress.full_name || ''}, ${shippingAddress.flat_house_no_building || ''}, ${shippingAddress.area_street_sector_village || ''}, ${shippingAddress.town_city || ''}, ${shippingAddress.pincode || ''}, ${shippingAddress.state || ''}, ${shippingAddress.country || ''}`}</span>
                            </div>
                            <div className="order-detail-item">
                                <span className="order-detail-label">Payment Method:</span>
                                <div className="order-detail-payment">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="Mastercard" />
                                    <span>{`**** **** **** ${paymentMethod.card_number ? paymentMethod.card_number.slice(-4) : '****'}`}</span>
                                </div>
                            </div>
                            <div className="order-detail-item">
                                <span className="order-detail-label">Delivery Method:</span>
                                <span>7 days, ₹30.58</span>
                            </div>
                            <div className="order-detail-item">
                                <span className="order-detail-label">Discount:</span>
                                <span>{calculateSavings(orderDetails.total_amount).discountRate}%</span>
                            </div>
                            <div className="order-detail-item">
                                <span className="order-detail-label">Total Amount:</span>
                                <span>₹{orderDetails.total_amount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="order-detail-buttons">
                                <button className="feedback-button" onClick={toggleFeedback}>Leave Feedback</button>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Feedback Container */}
            {isFeedbackOpen && (
                <div className="feedback-container">
                    <div className="feedback-content">
                        <button className="close-feedback-button" onClick={toggleFeedback}><i className="fa-solid fa-x"></i></button>
                        <h3>Feedback</h3>
                        <textarea 
                            placeholder="Write your feedback here..."
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                        ></textarea>
                        <button className="submit-feedback-button" onClick={handleFeedbackSubmit}>Submit</button>
                        {feedbackStatus && (
                            <div className={`feedback-status ${feedbackStatus === 'Feedback submitted successfully!' ? 'success' : 'error'}`}>
                                {feedbackStatus}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
