import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import api from '../api';
import './BusinessOwnerProductDetailPage.css';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function BusinessOwnerProductDetailPage() {
    const { orderedId } = useParams(); // Extracting orderId from URL params
    const [orderDetails, setOrderDetails] = useState(null);
    const [productDetails, setProductDetails] = useState([]); // To store detailed product info
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const isAuthenticated = localStorage.getItem('token'); // Authentication token from localStorage
    const [alignment, setAlignment] = useState('processing'); // Default status for toggle
    const [myBrand, setMyBrand] = useState(''); // Brand name

    useEffect(() => {
        const fetchBrandAndOrderDetails = async () => {
            try {
                // Fetching brand information
                const brandResponse = await api.get(`/api/business/brand-name`, {
                    headers: { Authorization: `Bearer ${isAuthenticated}` },
                });
                setMyBrand(brandResponse.data);

                // Fetching order info
                const response = await api.get(`/api/business/order-info/${orderedId}`, {
                    headers: { Authorization: `Bearer ${isAuthenticated}` },
                });

                const order = response.data.matchingOrders.find(ord => ord._id === orderedId);
                if (order) {
                    setOrderDetails(order);

                    // Fetching detailed product info
                    const productPromises = order.order_products.map(async (product) => {
                        const productResponse = await api.get(`/api/product/${product.product_id}`);
                        return {
                            ...product,
                            ...productResponse.data[0], // Merge basic and detailed product info
                        };
                    });

                    const detailedProducts = await Promise.all(productPromises);
                    setProductDetails(detailedProducts);
                } else {
                    setError("Order not found");
                }
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError('Error fetching order details');
            } finally {
                setIsLoading(false); // Stop loading after fetching
            }
        };

        fetchBrandAndOrderDetails();
    }, [orderedId, isAuthenticated]);

    if (isLoading) {
        return (
            <div className="order-detail-page">
                <Header />
                <header className="cart-header">
                    <h1>Order Details</h1>
                </header>
                <main className="order-details">
                    <Skeleton height={30} width={200} />
                    <Skeleton height={30} width={150} />
                    <Skeleton height={30} width={100} />
                    <Skeleton count={3} height={150} />
                </main>
            </div>
        );
    }

    if (error) {
        return <div>{error}</div>;
    }

    const handleChange = async (event, newAlignment, productId) => {
        try {
            if (!newAlignment) return; // Prevent deselection of all options

            // Update the status locally for instant feedback
            setProductDetails(prevProducts =>
                prevProducts.map(product =>
                    product._id === productId
                        ? { ...product, status: newAlignment }
                        : product
                )
            );

            // Update status in the backend
            const response = await api.put(
                `/api/business/order/update-status`,
                { productId, newStatus: newAlignment, orderedId },
                { headers: { Authorization: `Bearer ${isAuthenticated}` } }
            );

            if (response.status === 200) {
                console.log("Order status updated successfully.");
            } else {
                console.error("Failed to update the order status.");
            }
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    return (
        <div className="order-detail-page">
            <Header />
            <header className="cart-header">
                <h1>Order Details</h1>
            </header>

            <main className="order-details">
                {orderDetails && (
                    <>
                        <h2>Order Information</h2>
                        <p>Order No: {orderDetails.order_no}</p>
                        <p>Date: {new Date(orderDetails.order_date).toLocaleDateString()}</p>
                        <p>Total Amount: ₹{orderDetails.total_amount.toLocaleString('en-IN')}</p>
                        <p>Tracking ID: {orderDetails.tracking_id}</p>

                        <h3>Products:</h3>
                        {productDetails.length > 0 ? (
                            productDetails.map(product => {
                                const isMatch = product.brand === myBrand; // Check if the product brand matches
                                return (
                                    <div key={product._id} className={`product-cardbb ${isMatch ? 'match' : 'no-match'}`}>
                                        <div className={`product-image ${isMatch ? '' : 'blur'}`}>
                                            <img src={product.image[0]?.img || 'default_image_url'} alt={product.title || 'Product Image'} />
                                        </div>
                                        <div className="product-info">
                                            <h4 className={`product-title ${isMatch ? '' : 'blur'}`}>{product.title || 'Untitled Product'}</h4>
                                            <div className="product-rating">
                                                <span>⭐ {product.rating?.rate || 0}</span>
                                                <span>({product.rating?.count || 0} reviews)</span>
                                            </div>
                                            <p className={`product-price ${isMatch ? '' : 'blur'}`}>Price: ₹{product.price?.toLocaleString('en-IN') || 'N/A'}</p>
                                            <p className={`product-description ${isMatch ? '' : 'blur'}`}>Description: {product.description || 'No description available'}</p>
                                            <p>Brand: {product.brand || 'N/A'}</p>
                                            <p className={`product-description ${isMatch ? '' : 'blur'}`}>Quantity: {product.quantity || 0}</p>
                                            <p>Status: {product.status}</p>

                                            {isMatch ? (
                                                <ToggleButtonGroup
                                                    color={product.status === 'Processing' ? 'warning' : product.status === 'Delivered' ? 'success' : 'error'}
                                                    value={product.status}
                                                    exclusive
                                                    onChange={(event, newAlignment) => handleChange(event, newAlignment, product._id)} // Pass product ID
                                                    aria-label="Order Status"
                                                >
                                                    <ToggleButton 
                                                        value="Processing"
                                                        style={product.status === 'Processing' ? { backgroundColor: '#ffff006e', color: '#000' } : { backgroundColor: '#fff', color: '#000' }}
                                                    >
                                                        Processing
                                                    </ToggleButton>
                                                    <ToggleButton 
                                                        value="Delivered"
                                                        style={product.status === 'Delivered' ? { backgroundColor: '#00800091', color: 'white' } : { backgroundColor: '#fff', color: '#000' }}
                                                    >
                                                        Delivered
                                                    </ToggleButton>
                                                    <ToggleButton 
                                                        value="Cancelled"
                                                        style={product.status === 'Cancelled' ? { backgroundColor: '#ff0000b3', color: 'white' } : { backgroundColor: '#fff', color: '#000' }}
                                                    >
                                                        Cancelled
                                                    </ToggleButton>
                                                </ToggleButtonGroup>
                                            ) : (
                                                <div className="no-match-message">This is not your product!</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p>No products in this order.</p>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
