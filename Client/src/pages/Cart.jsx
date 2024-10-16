import React, { useState, useEffect } from 'react';
import './css/Cart.css';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Import the default skeleton CSS

export default function Cart() {
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem('token');  

    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [menuVisible, setMenuVisible] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Currency formatting function
    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    // Fetch cart data from the backend
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchCartData = async () => {
            try {
                const response = await api.get('/api/cart', {
                    headers: {
                        'Authorization': `Bearer ${isAuthenticated}`
                    }
                });
                const cartData = response.data.cart;
                setCartItems(cartData);
                fetchProductDetails(cartData.map(item => item.product_id));
            } catch (err) {
                setError('Failed to fetch cart data');
                console.error(err);
            }
        };

        fetchCartData();
    }, [isAuthenticated]);

    // Fetch product details based on product IDs
    const fetchProductDetails = async (productIds) => {
        try {
            const productDetailsPromises = productIds.map(productId => 
                api.get(`/api/product/${productId}`, {
                    headers: {
                        'Authorization': `Bearer ${isAuthenticated}`
                    }
                })
            );
            
            const responses = await Promise.all(productDetailsPromises);
            const products = responses.map(response => response.data);

            setProducts(products);
        } catch (err) {
            setError('Failed to fetch product details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (loading) {
        return (
            <div className="cart-page">
                <Header />
                <header className="cart-header">
                    <i className="fa-solid fa-chevron-left"></i>
                    <h1>My Bag</h1>
                </header>
                <main className="cart-content">
                    <Skeleton count={3} height={100} />
                    <Skeleton count={1} height={40} />
                </main>
            </div>
        );
    }

    if (error) {
        return <div>{error}</div>;
    }

    const handleQuantityChange = async (index, delta) => {
        const newCartItems = [...cartItems];
        newCartItems[index].quantity += delta;
        if (newCartItems[index].quantity < 1) newCartItems[index].quantity = 1;
        setCartItems(newCartItems);

        // Update quantity in database
        try {
            await api.patch(`/api/cart/${newCartItems[index]._id}`, 
            { quantity: newCartItems[index].quantity }, 
            {
                headers: {
                    'Authorization': `Bearer ${isAuthenticated}`
                }
            });
        } catch (err) {
            console.error('Failed to update quantity', err);
        }
    };

    const goBack = () => {
        window.history.back();
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const toggleMenu = (index) => {
        setMenuVisible(menuVisible === index ? null : index);
    };

    const handleAddToFavorites = async (id) => {
        try {
            await api.post('/api/favorites', { product_id: id }, {
                headers: {
                    'Authorization': `Bearer ${isAuthenticated}`
                }
            });
        } catch (err) {
            console.error('Failed to add to favorites', err);
        } finally {
            setMenuVisible(null);
        }
    };

    const handleRemoveFromList = async (id) => {
        try {
            await api.delete(`/api/cart/${id}`, {
                headers: {
                    'Authorization': `Bearer ${isAuthenticated}`
                }
            });
            // Update cartItems state to reflect removal
            setCartItems(cartItems.filter(item => item._id !== id));
        } catch (err) {
            console.error('Failed to remove from list', err);
        } finally {
            setMenuVisible(null);
        }
    };

 // Flattening products array if necessary
const flattenedProducts = products.flat(); // This will create a single-level array

// Merge cart items with product details
const mergedCartItems = cartItems.map(cartItem => {
    // Find the product that matches the product_id from the cartItem in the flattened array
    const product = flattenedProducts.find(product => product._id === cartItem.product_id);
    
    return { ...cartItem, ...(product || { title: 'Unknown Product', price: 0, image: [] }) }; 
});



    const isCartEmpty = mergedCartItems.length === 0;

    return (
        <div className="cart-page">
            <Header />
            <header className="cart-header">
                <i className="fa-solid fa-chevron-left" onClick={goBack}></i>
                <h1>My Cart</h1>
            </header>

            <main className="cart-content">
                {mergedCartItems.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    mergedCartItems.map((item, index) => (
                        <div key={item._id} className="cart-item-container">
                            {item.image?.length > 0 ? (
                                <img src={item.image[0].img} alt={item.title} />
                            ) : (
                                <Skeleton height={150} />
                            )}
                            <div className="cart-item-info">
                                <div className="cart-item-header">
                                    <div className="cart-item-details">
                                        <Link id='link-h1pp' to={`/product/${item._id}`}>
                                            <h1>{item.title}</h1>
                                        </Link>
                                        <span>{item.brand || 'N/A'}</span>
                                    </div>
                                    <span className="menu-cart-btn" onClick={() => toggleMenu(index)}>
                                        <i className="fa-solid fa-ellipsis-vertical"></i>
                                    </span>
                                </div>
                                {menuVisible === index && (
                                    <div className="menu-dropdown">
                                        <button onClick={() => handleAddToFavorites(item.product_id)}>Add to Favorites</button>
                                        <button onClick={() => handleRemoveFromList(item.product_id)}>Remove from List</button>
                                    </div>
                                )}
                                <div className="cart-item-footer">
                                    <div className="cart-quantity-container">
                                        <span onClick={() => handleQuantityChange(index, -1)}><i className="fa-solid fa-minus"></i></span>
                                        <h3>{item.quantity}</h3>
                                        <span onClick={() => handleQuantityChange(index, 1)}><i className="fa-solid fa-plus"></i></span>
                                    </div>
                                    <div className="cart-price">
                                        <p>{formatCurrency(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}

                <div className="promo-code-container">
                    <input type="text" placeholder="Enter your promo code" />
                    <button className="promo-apply-btn"><i className="fa-solid fa-caret-right"></i></button>
                </div>

                <div className="checkout-container">
                    <div className="total-amount">
                        <span>Total amount:</span>
                        <span>{formatCurrency(mergedCartItems.reduce((total, item) => total + item.price * item.quantity, 0))}</span>
                    </div>
                    <button 
                        className="checkout-btn" 
                        onClick={handleCheckout}
                        disabled={isCartEmpty}
                        style={{ 
                            backgroundColor: isCartEmpty ? '#ccc' : '#d84303', 
                            cursor: isCartEmpty ? 'not-allowed' : 'pointer' 
                        }}
                    >
                        CHECK OUT
                    </button>
                </div>
            </main>
        </div>
    );
}
