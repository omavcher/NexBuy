import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './css/Header.css';

export default function Header() {
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');

    const toggleDropdown = () => {
        setDropdownVisible(!isDropdownVisible);
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        console.log(`Selected category: ${category}`);
        setDropdownVisible(false); // Hide dropdown after selection
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
                <input type='text' placeholder='Search essentials, tech, and more...' />
                <i className="fa-solid fa-magnifying-glass"></i>
                <div className={`catagory-dropdown ${isDropdownVisible ? 'show' : ''}`}>
                    <div onClick={() => handleCategoryClick('All Categories')}>All Categories</div>
                    <div onClick={() => handleCategoryClick('Appliances')}>Appliances</div>
                    <div onClick={() => handleCategoryClick('Electronics')}>Electronics</div>
                    <div onClick={() => handleCategoryClick('Fashion')}>Fashion</div>
                </div>
            </div>

            <div className='signup-cart-container'>
                <Link to='/signup' id='login-btn'>
                    <i className="fa-regular fa-user"></i>
                    <h4>Sign Up/Sign In</h4>
                </Link>

                <Link to='/cart' id='cart-btn'>
                    <i className="fa-solid fa-cart-shopping"></i>
                    <h4>Cart</h4>
                </Link>
            </div>
        </div>
    );
}
