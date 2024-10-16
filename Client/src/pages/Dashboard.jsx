import React, { useState, useEffect } from 'react';
import './css/Dashboard.css';
import Header from '../components/Header';
import { Navigate, Link } from 'react-router-dom';
import ImageUploading from 'react-images-uploading';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import api from '../api';
import { Cloudinary } from '@cloudinary/url-gen';
import Analytics from '../components/Analytics'; // Assuming you have an Analytics component
import axios from 'axios';
import CryptoJS from 'crypto-js'; // Import the library
import ProductList from '../components/ProductList';

export default function Dashboard() {
    const [selectedSection, setSelectedSection] = useState('products');
    const [products, setProducts] = useState([]);
    const [brand, setBrand] = useState({});
    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [businessAccount, setBusinessAccount] = useState({});
    const [userData, setUserData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [newProduct, setNewProduct] = useState({});
    const [images, setImages] = useState([]);
    const [error, setError] = useState('');
    const maxNumber = 6;
    const isAuthenticatedisbusiness = localStorage.getItem('account_type');
    const isAuthenticated = localStorage.getItem('token');
    const locationId = 'dashbord-page'; 
    const [myBrand, setMyBrand] = useState(''); // Brand name

    if (isAuthenticatedisbusiness !== 'business') {
        return <Navigate to="/login" />;
    }

    
    const cld = new Cloudinary({
        cloud: {
            cloudName: 'dsm6pjmxt', // replace with your Cloudinary cloud name
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const brandResponse = await api.get(`/api/business/brand-name`, {
                    headers: { Authorization: `Bearer ${isAuthenticated}` },
                });
                setMyBrand(brandResponse.data);
                fetchProductData();
                fetchUserData();
                fetchOrderData();
                fetchFeedbackData();
                fetchBrandData();
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        fetchData();
    }, []);
    

    // Format price to INR currency format
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
    };

    // Format date to 'dd/mm/yyyy' format
    const formatDate = (dateString) => {
        return new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(dateString));
    };

    // Function to fetch product data
    const fetchProductData = () => {
        if (isAuthenticatedisbusiness) {
            api.get(`/api/users/orders/detail`, {
                headers: { Authorization: `Bearer ${isAuthenticated}` },
                params: { account_type: isAuthenticatedisbusiness },
            })
            .then(response => {
                setProducts(response.data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching product data:', error);
                setError('Error fetching product data');
                setIsLoading(false);
            });
        }
    };

    const fetchUserData = () => {
        setUserData({
            name: "Om Awchar",
            email: "omawchar07@gmail.com",
            mobile: "9890712303",
            total_amount: 1300,
            business_account: {
                business_name: "Erfundenes Unternehmen",
                email: "test@beispiel.de",
                phone_number: "030303986300",
                address: "Erfundene Straße 33"
            },
            shipping_add: [],
            payment_methods: [],
            orders: [],
            reviews: []
        });
    };

    const fetchFeedbackData = () => {
        setReviews([
            {
                _id: "66d52655ce4ea3029e8ec995",
                userId: "66d3e94f8a05052f502d4562",
                orderId: "1",
                feedbackText: "Great product!",
                createdAt: "2024-09-02T02:43:33.055Z",
                updatedAt: "2024-09-02T02:43:33.055Z",
                __v: 0
            }
        ]);
    };

    const fetchOrderData = async () => { 
        try {
            const response = await api.get(`/api/business/order-info/${myBrand}`, {
                headers: { Authorization: `Bearer ${isAuthenticated}` },
            });
    
            // Assuming response.data has the structure you provided
            setOrders(response.data.matchingOrders || []); // Set the orders from the response
        } catch (error) {
            console.error('Error fetching order data:', error);
        }
    };
    

    const fetchBrandData = async () => {
        try {
            const response = await api.get(`/api/user-details?locationId=${locationId}`, {
                headers: {
                    'Authorization': `Bearer ${isAuthenticated}`,
                }
            });
    
            const userData = response.data; 
            setBrand({
                _id: userData.business_account._id || "default_id", // Use business account ID or a default
                name: userData.business_account.business_name || "Default Brand", // Use business name or a default
                logo: userData.business_account.logo || "https://default-logo-url.com/logo.png", // Placeholder for logo
                followers: userData.followers || 0, // Assuming followers is part of userData, replace with correct field if needed
                createdAt: userData.createdAt || new Date().toISOString() ,
                total_listed_product: userData.business_account.listed_product.length || 0
            });
        } catch (error) {
            console.error("Error fetching brand data:", error);
        }
    };
    
    const ImgonChange = (imageList) => {
        setImages(imageList);
    };

    const generateSignature = (apiSecret, params) => {
        const sortedParams = Object.keys(params)
            .filter(key => key !== 'file') // Exclude 'file'
            .sort()
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');

        const signatureString = `${sortedParams}&api_secret=${apiSecret}`;
        return CryptoJS.SHA1(signatureString).toString(CryptoJS.enc.Hex);
    };

   // Function to upload a single image to Cloudinary
const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'nexbuy_preset'); // Replace with your actual preset

    const response = await axios.post(`https://api.cloudinary.com/v1_1/dsm6pjmxt/image/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data.secure_url; // Return the secure URL
};

const handleCreateProduct = async () => {
    if (!newProduct.title || !newProduct.description || !newProduct.price || !newProduct.stock) {
        setError('Please fill in all required fields.');
        return;
    }
    
    try {
        const imageUrls = await Promise.all(
            images.map(async (imageFile) => {
                if (imageFile.file) {
                    return await uploadImageToCloudinary(imageFile.file);
                }
                return null; // Handle case where no file is present
            })
        );

        // Filter out any null values in case some uploads failed
        const validImageUrls = imageUrls.filter(url => url !== null);

        const formData = new FormData();
        formData.append('title', newProduct.title);
        formData.append('description', newProduct.description);
        formData.append('category', newProduct.category);
        formData.append('sub_category', newProduct.sub_category);
        formData.append('price', newProduct.price);
        formData.append('stock', newProduct.stock);
        formData.append('brand', newProduct.brand);
        
        // Append each image URL individually
        validImageUrls.forEach(url => formData.append('images', url));

        for (let pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }

        const response = await api.post('/api/business/create-product', formData, {
            headers: { 
                Authorization: `Bearer ${isAuthenticated}`,
                account_type: isAuthenticatedisbusiness,
                'Content-Type': 'multipart/form-data'
            }
        });

        setProducts([...products, response.data]);
        setNewProduct({});
        setImages([]);
        setError('');
    } catch (error) {
        console.error('Error creating product:', error);
        setError('Failed to create product.');
    }
};

const handleUpdateBrand = async () => {
    try {
        let logoUrl = brand.logo; 
        if (images.length > 0) {
            logoUrl = await uploadImageToCloudinary(images[0].file); 
        }

        const updatedBrand = {
            ...brand,
            logo: logoUrl 
        };

        await api.put(`/api/business/update-brand`, updatedBrand, {
            headers: { 
                Authorization: `Bearer ${isAuthenticated}`,
                account_type: isAuthenticatedisbusiness,
            }
        });

        setBrand(updatedBrand); 
    } catch (error) {
        console.error("Error updating brand:", error);
    }
};

    return (
        <>
            <Header />
            <div className="dashboard">
                <div className="sidebar">
                    <h2>Seller Dashboard</h2>
                    <ul>
                    <li onClick={() => setSelectedSection('analytics')}><h5>Analytics</h5><i className="fa-solid fa-chart-bar"></i></li>
                        <li onClick={() => setSelectedSection('products')}><h5>Manage Products</h5><i className="fa-solid fa-shop"></i></li>
                        <li onClick={() => setSelectedSection('brand')}><h5>Manage Brand</h5><i className="fa-brands fa-square-web-awesome"></i></li>
                        <li onClick={() => setSelectedSection('orders')}><h5>Manage Orders</h5><i className="fa-solid fa-cart-shopping"></i></li>
                        <li onClick={() => setSelectedSection('reviews')}><h5>Reviews & Feedback</h5><i className="fa-solid fa-comments"></i></li>
                        <li onClick={() => setSelectedSection('business')}><h5>Business Account</h5><i className="fa-solid fa-id-card-clip"></i></li>
                        
                    </ul>
                </div>

                <div className="content">
                    {selectedSection === 'products' && (
                        <div>
                            <h2>Manage Products</h2>
                            <div>
                                <ImageUploading
                                    multiple
                                    value={images}
                                    onChange={ImgonChange}
                                    maxNumber={maxNumber}
                                    dataURLKey="data_url"
                                >
                                    {({
                                        imageList,
                                        onImageUpload,
                                        onImageRemoveAll,
                                        onImageUpdate,
                                        onImageRemove,
                                        isDragging,
                                        dragProps,
                                    }) => (
                                        <div className="upload__image-wrapper">
                                            <button
                                                style={isDragging ? { color: 'red' } : undefined}
                                                onClick={onImageUpload}
                                                {...dragProps}
                                            >
                                                Click or Drop here
                                            </button>
                                            &nbsp;
                                            <button onClick={onImageRemoveAll}>Remove all images</button>
                                            {imageList.map((image, index) => (
                                                <div key={index} className="image-item">
                                                    <img src={image['data_url']} alt="" width="100" />
                                                    <div className="image-item__btn-wrapper">
                                                        <button onClick={() => onImageUpdate(index)}>Update</button>
                                                        <button onClick={() => onImageRemove(index)}>Remove</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ImageUploading>

                                <input
        type="text"
        placeholder="Product Title"
        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
    />
    <input
        type="text"
        placeholder="Description"
        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
    />
    <select
        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
    >
        <option value="">Select Category</option>
<option value="electronics">Electronics</option>
<option value="clothing">Clothing</option>
<option value="home appliances">Home appliances</option>
<option value="food">Food</option>
<option value="kitchen">Kitchen</option>
<option value="health">Health</option>
<option value="garden">Garden</option>
<option value="footwear">Footwear</option>
<option value="grocery">Grocery</option>
<option value="groceries">Groceries</option>
<option value="beauty">Beauty</option>
<option value="apparel">Apparel</option>
<option value="attractive-deals">Attractive-deals</option>

    </select>
    <select
        onChange={(e) => setNewProduct({ ...newProduct, sub_category: e.target.value })}
    >
        <option value="">Select Subcategory</option>
<option value="phones">Phones</option>
<option value="footwear">Footwear</option>
<option value="kitchen">Kitchen</option>
<option value="nuts">Nuts</option>
<option value="headphones">Headphones</option>
<option value="jeans">Jeans</option>
<option value="oral care">Oral care</option>
<option value="breads">Breads</option>
<option value="vegetables">Vegetables</option>
<option value="beverages">Beverages</option>
<option value="foodgrains">Foodgrains</option>
<option value="laptops">Laptops</option>
<option value="refrigerator">Refrigerator</option>
<option value="smartwatch">Smartwatch</option>
<option value="air_conditioner">Air conditioner</option>
<option value="television">Television</option>
<option value="bath-hand-wash">Bath hand wash</option>
<option value="fragrances-deos">Fragrances deos</option>
<option value="haircare">Haircare</option>
<option value="boys-wear">Boys wear</option>
<option value="girl-wear">Girl wear</option>
<option value="home-appliances">Home appliances</option>
<option value="sports-fitness">Sports fitness</option>
<option value="furniture">Furniture</option>

    </select>
    <input
        type="number"
        placeholder="Price"
        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
    />
                                <input
                                    type="number"
                                    placeholder="Stock"
                                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                                />
                                <button onClick={handleCreateProduct}>Add Product</button>
                            </div>
                            <ProductList/>
                        </div>
                    )}

                    {selectedSection === 'brand' && (
                         <div>
                         <h2>Manage Brand</h2>
                         <div className='mange-brand-div'>
                             {brand.logo ? (
                                 <img src={brand.logo} alt={brand.name} style={{ width: '100px', height: '100px' }} />
                             ) : (
                                 <p>No picture uploaded. Upload now!</p>
                             )}
                             <h4>Followers: {brand.followers}</h4>
                             <p>Created at: {formatDate(brand.createdAt)}</p>
                             <p style={{ color: "red" }}>Total Listed: {brand.total_listed_product}</p>
                         </div>

                         <ImageUploading
                             multiple={false}
                             value={images}
                             onChange={ImgonChange}
                             maxNumber={maxNumber}
                             dataURLKey="data_url"
                         >
                             {({
                                 imageList,
                                 onImageUpload,
                                 onImageRemoveAll,
                             }) => (
                                 <div>
                                     <button onClick={onImageUpload}>Change Logo</button>
                                     &nbsp;
                                     <button onClick={onImageRemoveAll}>Remove image</button>
                                     {imageList.map((image, index) => (
                                         <div key={index} className="image-item">
                                             <img src={image['data_url']} alt="" width="100" />
                                         </div>
                                     ))}
                                 </div>
                             )}
                         </ImageUploading>

                         <input style={{marginTop:'1rem'}} type="text" value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value })} />
                         <button onClick={handleUpdateBrand}>Update Brand</button>
                     </div>
                    )}

                    {selectedSection === 'orders' && (
                       <div>
                       <h2>Manage Orders</h2>
                       
                       {orders.length > 0 ? (
                           <ul>
                               {orders.map((order, index) => (
                                   <li key={index}>
                                       <div className='manage-order-detila-busdv'>
                                           <h3>Order - {order._id}</h3> 
                                           <h4>Price - {formatPrice(order.total_amount)}</h4>
                                           <p>Order Date - {formatDate(order.order_date)}</p>
                                       </div>
                   
                                       <div className="order-status-buttons">
                                           <p>Order Status:</p>
                                           {order.order_products.map((product, idx) => (
                                               <div key={idx}>
                                                   <p><span>{product.status}</span></p>
                                               </div>
                                           ))}
                   
                                           <Link to={`/business/manage-order/${order._id}`}>
                                               <div className="button-57" role="button">
                                                   <span className="text">Order</span>
                                                   <span>Manage Order</span>
                                               </div>
                                           </Link>
                                       </div>
                                   </li>
                               ))}
                           </ul>
                       ) : (
                           <p>No one has ordered yet.</p>
                       )}
                   </div>
                   
                    
                    )}

                    {selectedSection === 'reviews' && (
                        <div>
                            <h2>Reviews & Feedback</h2>
                            <ul>
                                {reviews.map((review, index) => (
                                    <li key={index}>
                                          <div className=''>

                                          </div>
                                        Product ID: {review.productId} - Rating: {review.rating} - Comment: {review.comment}

                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {selectedSection === 'business' && (
                        <div>
                            <h2>Business Account</h2>
                            <div>
                                <input type="text" value={userData.business_account?.business_name} onChange={(e) => setBusinessAccount({ ...businessAccount, business_name: e.target.value })} />
                                <input type="email" value={userData.business_account?.email} onChange={(e) => setBusinessAccount({ ...businessAccount, email: e.target.value })} />
                                <input type="tel" value={userData.business_account?.phone_number} onChange={(e) => setBusinessAccount({ ...businessAccount, phone_number: e.target.value })} />
                                <button onClick={handleUpdateBusinessAccount}>Update Business Account</button>
                            </div>

                            
                        </div>
                    )}

<div className="content">
                    {selectedSection === 'analytics' && <Analytics />} {/* Render Analytics */}
                    {/* ... other sections */}
                </div>

                </div>
            </div>
        </>
    );
}
