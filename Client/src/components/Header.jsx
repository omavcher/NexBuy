// src/components/Header.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './css/Header.css';
import { checkAuthentication } from '../authenticate'; // Import the checkAuthentication function
import api from '../api';

export default function Header() {
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        fetchProductNames(selectedCategory);

        const verifyAuthentication = async () => {
            const authStatus = await checkAuthentication();
            setIsAuthenticated(authStatus);
        };
        verifyAuthentication();
    }, [selectedCategory]);

    const fetchProductNames = (category) => {
        api.post('/api/product-names', { category })
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error('Error fetching product names:', error);
            });
    };

    const toggleDropdown = () => {
        setDropdownVisible(!isDropdownVisible);
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setSearchText('');
        setDropdownVisible(false);
    };

    const handleSearchChange = (event) => {
        const text = event.target.value;
        setSearchText(text);
    
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
    
        setSearchTimeout(setTimeout(() => {
            if (text.length > 1) {
                setFilteredProducts(
                    products.filter(product => 
                        product.name && product.name.toLowerCase().includes(text.toLowerCase())
                    )
                );
            } else {
                setFilteredProducts([]);
            }
        }, 300));
    };

    const handleSuggestionClick = (product) => {
        let searchItems = JSON.parse(sessionStorage.getItem('searchItems')) || [];
        if (!searchItems.find(item => item.id === product.id)) {
            searchItems.push(product);
            sessionStorage.setItem('searchItems', JSON.stringify(searchItems));
        }
    };

    return (
        <div className='Header-container'>
            <div className='logo-container'>
                <a href='/'>
                    <img alt='NexBuy' src='/cart_logo.png' />
                </a>
                <h1>NexBuy</h1>
            </div>

            <div className='SearchBox-container'>
                <div className="icon-container" onClick={toggleDropdown}>
                    <i className={`fa-solid ${isDropdownVisible ? 'fa-x active' : 'fa-bars'}`}></i>
                </div>
                <input
                    type='text'
                    placeholder='Search essentials, tech, and more...'
                    value={searchText}
                    onChange={handleSearchChange}
                />
                <i className="fa-solid fa-magnifying-glass"></i>
                <div className={`catagory-dropdown ${isDropdownVisible ? 'show' : ''}`}>
                    <div onClick={() => handleCategoryClick('All Categories')}>All Categories</div>
                    <div onClick={() => handleCategoryClick('Home Appliances')}>Home Appliances</div>
                    <div onClick={() => handleCategoryClick('Electronics')}>Electronics</div>
                    <div onClick={() => handleCategoryClick('Footwear')}>Footwear</div>
                </div>
                <div className='suggestions-tab'>
                    {filteredProducts.map((product, index) => (
                        <Link 
                            id='product-sugg' 
                            key={index} 
                            to={`/product/${product.id}`}
                            onClick={() => handleSuggestionClick(product)}
                        >
                            <div className='suggestion-item'>
                                {product.name}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className='signup-cart-container'>
                {!isAuthenticated ? (
                    <Link to='/signup' id='login-btn'>
                        <i className="fa-regular fa-user"></i>
                        <h4>Sign Up/Sign In</h4>
                    </Link>
                ) : (
                    <Link to='/profile' id='profile-btn'>
                        <i className="fa-regular fa-user"></i>
                        <h4>Profile</h4>
                    </Link>
                )}
                
                <Link to='/cart' id='cart-btn'>
                    <i className="fa-solid fa-cart-shopping"></i>
                    <h4>Cart</h4>
                </Link>
            </div>
        </div>
    );
}
