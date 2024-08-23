import React, { useState } from 'react'; // Import useState
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './css/Header.css';

export default function Header() {
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    const toggleDropdown = () => {
        setDropdownVisible(!isDropdownVisible);
    };

    return (
        <div className='Header-container'>
            <div className='logo-container'>
                <a href='/'>
                    <img alt='NexBuy' src='/cart_black.png' />
                </a>
                <h1>NexBuy</h1>
            </div>
            <div className='SearchBox-container'>
                <i className="fa-solid fa-bars" onClick={toggleDropdown}></i>
                <input type='text' placeholder='Search essentials, tech, and more...' />
                <i className="fa-solid fa-magnifying-glass"></i>
                <div className={`catagory-dropdown ${isDropdownVisible ? 'show' : ''}`}></div>
            </div>

            <div className='signup-cart-container'>
                <Link to='/login' id='login-btn'>
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
