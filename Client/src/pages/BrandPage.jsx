import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FlashMessageContext from '../components/FlashMessageContext';
import Header from '../components/Header';
import './css/BrandPage.css';
import api from '../api';
import Loading from '../components/Loading';
import ProductItemCard from '../components/ProductItemCard';

export default function BrandPage() {
    const { brand } = useParams();
    const [brandData, setBrandData] = useState(null);
    const [products, setProducts] = useState([]);
    const [flashMessage, setFlashMessage] = useState({ message: '', type: '' });
    const [isFollowed, setIsFollowed] = useState(false); // State to track follow status
    const navigate = useNavigate();

    const capitalizeWords = (str) => {
        return str.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    useEffect(() => {
        const formattedBrand = capitalizeWords(brand);
        document.title = `NexBuy - ${formattedBrand}`;

        // Fetch all products
        api.get('/api/all-product')
            .then(response => {
                setProducts(response.data);
                return api.get(`/api/brands/${brand}`);
            })
            .then(response => {
                setBrandData(response.data);
                // Set initial follow state (could be fetched from user profile or similar)
                // Example: setIsFollowed(response.data.isFollowed);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setFlashMessage({ message: 'Failed to load data.', type: 'error' });
            });
    }, [brand]);

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleShare = () => {
        const formattedBrand = capitalizeWords(brand);

        if (navigator.share) {
            navigator.share({
                title: `NexBuy - ${formattedBrand}`,
                text: `Check out these products from ${formattedBrand} on NexBuy!`,
                url: window.location.href,
            })
            .then(() => {
                setFlashMessage({ message: 'Page shared successfully!', type: 'success' });
            })
            .catch((error) => {
                setFlashMessage({ message: `Failed to share: ${error.message}`, type: 'error' });
            });
        } else {
            navigator.clipboard.writeText(window.location.href)
            .then(() => {
                setFlashMessage({ message: 'Link copied to clipboard!', type: 'success' });
            })
            .catch((error) => {
                setFlashMessage({ message: `Failed to copy link: ${error.message}`, type: 'error' });
            });
        }
    };

    const formatFollowers = (number) => {
        if (number >= 10000000) {
            return (number / 1000000).toFixed(1) + 'M';
        } else if (number >= 1000000) {
            return (number / 1000000).toFixed(0) + 'M';
        } else if (number >= 10000) {
            return (number / 1000).toFixed(0) + 'k';
        } else if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'k';
        } else {
            return number;
        }
    };

    const filteredProducts = products.filter(product => product.brand === brand);

    const handleFollow = () => {
        const newFollowStatus = !isFollowed;
        api.post(`/api/brands/${brand}/${newFollowStatus ? 'follow' : 'unfollow'}`)
            .then(() => {
                setIsFollowed(newFollowStatus);
                setFlashMessage({
                    message: newFollowStatus ? 'You are now following this brand!' : 'You have unfollowed this brand!',
                    type: 'success',
                });
            })
            .catch((error) => {
                setFlashMessage({
                    message: `Failed to ${newFollowStatus ? 'follow' : 'unfollow'}: ${error.message}`,
                    type: 'error',
                });
            });
    };

    if (!brandData) {
        return <Loading />;
    }

    return (
        <div>
            <Header />
            <main>
                <FlashMessageContext
                    message={flashMessage.message}
                    type={flashMessage.type}
                    onClose={() => setFlashMessage({ message: '', type: '' })}
                />
                <div className="brand-header">
                    <span className="back-btn" onClick={handleGoBack}>
                        <i className="fa-solid fa-chevron-left"></i>
                    </span>
                    <span className="brand-title">{capitalizeWords(brand)}</span>
                    <span className="share-btn" onClick={handleShare}>
                        <i className="fa-solid fa-share"></i>
                    </span>
                </div>
                <section className="brand-info">
                    {brandData.logo && (
                        <div className="brand-logo">
                            <img src={brandData.logo} alt={`${brand} Logo`} />
                        </div>
                    )}
                    <div className="brand-details">
                        <p>{brandData.description}</p>
                        <h4>{formatFollowers(brandData.followers)} Followers</h4>
                        <button className="follow-btn" onClick={handleFollow}>
                            {isFollowed ? 'Unfollow' : '+ Follow'}
                        </button>
                    </div>
                </section>
                <h3 className="product-header">Our Products in Your Service</h3>
                <section className="product-list">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <ProductItemCard
                                key={product._id}
                                product={product}
                                className="brand-page-product-card"
                            />
                        ))
                    ) : (
                        <div className="no-products">
                            <h2>No products available for this brand.</h2>
                            <p>We don't have any products listed under this brand at the moment. Please check back later or explore other brands.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
