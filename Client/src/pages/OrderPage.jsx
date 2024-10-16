import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import './css/OrderPage.css'; // Ensure this file contains the relevant CSS for styling
import api from '../api.js'; // Ensure api.js exports an Axios instance or similar HTTP client
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Import Skeleton styles

export default function OrderPage() {
  const isAuthenticated = localStorage.getItem('token');
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('Processing'); // Default filter
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'NexBuy - My Orders';
    return () => {
      document.title = 'NexBuy';
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const fetchOrders = async () => {
      try {
        // Fetch orders from the API
        const response = await api.get('/api/orders', {
          headers: {
            'Authorization': `Bearer ${isAuthenticated}`,
          }
        });

        if (response.status !== 200) {
          throw new Error('Network response was not ok');
        }

        const fetchedOrders = response.data;
        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders.filter(order => 
          order.order_products.some(product => product.status === selectedFilter)
        ));
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, selectedFilter]);

  const goBack = () => {
    navigate(-1);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  const calculateTotalQuantity = (order) => {
    return order.order_products.reduce((total, product) => total + product.quantity, 0);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setFilteredOrders(orders.filter(order => 
      order.order_products.some(product => product.status === filter)
    ));
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <Header />
      <header className="order-header">
        <i className="fa-solid fa-chevron-left" onClick={goBack}></i>
        <h1>My Orders</h1>
      </header>
      <main>
        <div className="order-category-container">
          {['Delivered', 'Processing', 'Cancelled'].map((filter, index) => (
            <span
              key={index}
              className="order-filter"
              id={selectedFilter === filter ? 'selected-filter' : ''}
              onClick={() => handleFilterChange(filter)}
            >
              {filter}
            </span>
          ))}
        </div>
        <section className="order-list">
          {loading ? (
            <div className="skeleton-loader">
              <Skeleton height={30} width={200} style={{ marginBottom: '10px' }} />
              <Skeleton count={3} height={20} style={{ marginBottom: '10px' }} />
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <div key={index} className="order-container">
                <div className="top-order-section">
                  <h1>Order No: {order.order_no}</h1>
                  <p>{new Date(order.order_date).toLocaleDateString()}</p>
                </div>
                <div id="tracking-span">
                  <p>Tracking number: <span>{order.tracking_id}</span></p>
                </div>
                <div id="other-order-div">
                  <p>Total Quantity: <span>{calculateTotalQuantity(order)}</span></p>
                  <p>Total Amount: <span>{formatCurrency(order.total_amount)}</span></p>
                </div>
                <div className="order-last-sec">
                  <Link to={`detail/${order.order_no}`} id="detail-btn">Details</Link>
                  <span
                    style={{ color: order.order_products.some(product => product.status === 'Delivered') ? '#2AA952' : 
                            order.order_products.some(product => product.status === 'Cancelled') ? 'red' : '#cece00' }}
                    className="order-status"
                  >
                    {order.order_products.find(product => product.status === selectedFilter)?.status || 'Unknown'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>No orders available in this category.</p>
          )}
        </section>
      </main>
    </div>
  );
}
