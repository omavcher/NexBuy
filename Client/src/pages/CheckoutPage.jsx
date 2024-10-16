import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './css/CheckoutPage.css';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem('token');
    const [user, setUser] = useState(null); 
    const [deliveryMethod, setDeliveryMethod] = useState("FedEx");
    const [shippingAddresses, setShippingAddresses] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const calculateTotalPrice = () => {
        if (Array.isArray(cartItems)) {
            return cartItems.reduce((total, item) => {
                const product = products[item.product_id];
                return total + (product ? product.price * item.quantity : 0);
            }, 0);
        }
        return 0;
    };

    const totalPrice = calculateTotalPrice();
    const deliveryCost = 30.58; 
    const orderTotal = totalPrice + deliveryCost;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = localStorage.getItem('userId');
                const userResponse = await api.get(`/api/user/${userId}`, {
                    headers: { 'Authorization': `Bearer ${isAuthenticated}` }
                });
                setUser(userResponse.data);

                const addressResponse = await api.get('/api/addresses', {
                    headers: { 'Authorization': `Bearer ${isAuthenticated}` }
                });

                const paymentResponse = await api.get(`/api/users/${userId}/payment-methods`, {
                    headers: { 'Authorization': `Bearer ${isAuthenticated}` }
                });

                const cartResponse = await api.get(`/api/cart`, {
                    headers: { 'Authorization': `Bearer ${isAuthenticated}` }
                });

                setShippingAddresses(addressResponse.data || []);
                setPaymentMethods(paymentResponse.data.payment_methods || []);
                setSelectedAddress(addressResponse.data.find(address => address.default_address) || {});
                setSelectedPaymentMethod(paymentResponse.data.payment_methods.find(method => method.default_payment_method) || {});
                setCartItems(Array.isArray(cartResponse.data.cart) ? cartResponse.data.cart : []);

                const productIds = cartResponse.data.cart.map(item => item.product_id);
                const productDetailsPromises = productIds.map(id => api.get(`/api/product/${id}`, {
                    headers: { 'Authorization': `Bearer ${isAuthenticated}` }
                }));
                
                const productDetailsResponses = await Promise.all(productDetailsPromises);
                const productDetails = productDetailsResponses.reduce((acc, response) => {
                    acc[response.data._id] = response.data;
                    return acc;
                }, {});

                setProducts(productDetails);
            } catch (err) {
                setError(err.response?.data?.message || 'An error occurred. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated]);

    const goBack = () => {
        window.history.back();
    };

    const handleDeliveryChange = (method) => {
        setDeliveryMethod(method);
    };

    const handleOrderSubmit = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const orderResponse = await api.post('/api/submit-order', {
                deliveryMethod,
                shippingAddress: selectedAddress,
                paymentMethod: selectedPaymentMethod,
                paymentAmount: orderTotal,
                cartItems,
                userId
            }, {
                headers: {
                    'Authorization': `Bearer ${isAuthenticated}`,
                }
            });

            const { orderId, amount, currency } = orderResponse.data;

            const options = {
                key: "rzp_test_u0ss8IzlD0a6qs", 
                amount: orderTotal * 100, 
                currency: currency,
                name: "NexBuy",
                description: "Order Payment",
                order_id: orderId,
                handler: async function (response) {
                    try {
                        const userId = localStorage.getItem('userId')
                        const paymentVerificationResponse = await api.post('/api/verify-payment', {
                            userId,
                            orderId,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        });

                        navigate('/order-confirmation'); 
                    } catch (error) {
                        console.error("Payment verification failed", error);
                        setError('Payment verification failed.');
                    }
                },
                prefill: {
                    name: user?.full_name || '', 
                    email: user?.email || "", 
                    contact: user?.contact || "" 
                },
                theme: {
                    color: "#FB4B04"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while submitting the order.');
        }
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    if (loading) return (
        <div className="checkout-page">
            <Header />
            <header className="checkout-header">
                <i className="fa-solid fa-chevron-left" onClick={goBack}></i>
                <h1>Checkout</h1>
            </header>
            <main className="checkout-content">
                <div className="shipping-section">
                    <Skeleton height={100} />
                </div>
                <div className="payment-section">
                    <Skeleton height={100} />
                </div>
                <div className="order-summary">
                    <Skeleton height={50} count={5} />
                </div>
                <Skeleton height={40} width={200} />
            </main>
        </div>
    );

    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="checkout-page">
            <Header />
            <header className="checkout-header">
                <i className="fa-solid fa-chevron-left" onClick={goBack}></i>
                <h1>Checkout</h1>
            </header>

            <main className="checkout-content">
                <div className="shipping-section">
                    <div className="shipping-address">
                        {selectedAddress ? (
                            <div>
                                <p>{selectedAddress.full_name || 'N/A'}</p>
                                <p>{selectedAddress.flat_house_no_building || 'N/A'}, {selectedAddress.area_street_sector_village || 'N/A'}</p>
                                <p>{selectedAddress.town_city || 'N/A'}, {selectedAddress.state || 'N/A'} {selectedAddress.pincode || 'N/A'}, {selectedAddress.country || 'N/A'}</p>
                                <p>{selectedAddress.delivery_instructions || 'N/A'}</p>
                            </div>
                        ) : (
                            <p>No address selected</p>
                        )}
                        <Link id='Link' to={`/addresses`}>
                            <span className="change-btn">Change</span>
                        </Link>
                    </div>
                </div>

                {paymentMethods.length > 0 && (
                    <div className="payment-section">
                        <div className="payment-method">
                            {selectedPaymentMethod ? (
                                <div className="card-display">
                                    <Cards
                                        cvc={selectedPaymentMethod.cvv || ''}
                                        expiry={selectedPaymentMethod.expiry_date || ''}
                                        focused=""
                                        name={selectedPaymentMethod.card_name || ''}
                                        number={selectedPaymentMethod.card_number || ''}
                                    />
                                </div>
                            ) : (
                                <p>No payment method selected</p>
                            )}
                            <Link id='Link' to={`/payment-methods`}>
                                <span className="change-btn">Change</span>
                            </Link>
                        </div>
                    </div>
                )}

                <div className="order-summary">
                    {cartItems.map(item => {
                        const product = products[item.product_id];
                        if (!product) return null;

                        return (
                            <div className="order-item" key={item._id}>
                                <img src={product.image[0]?.img} alt={product.title} className="product-image"/>
                                <div className="product-details">
                                    <h4>{product.title}</h4>
                                    <p>{formatCurrency(product.price)}</p>
                                </div>
                            </div>
                        );
                    })}

                    <div className="summary-row">
                        <span>Order Total:</span>
                        <span>{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Delivery:</span>
                        <span>{formatCurrency(deliveryCost)}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Summary:</span>
                        <span>{formatCurrency(orderTotal)}</span>
                    </div>
                </div>

                <button className="submit-order-btn" onClick={handleOrderSubmit}>
                    SUBMIT ORDER
                </button>
            </main>
        </div>
    );
}
