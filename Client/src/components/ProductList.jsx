import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@mui/material';
import Rating from '@mui/material/Rating';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editedProduct, setEditedProduct] = useState({});
    const locationId = 'listedproduct-compo';
    const isAuthenticated = localStorage.getItem('token');
    const isAuthenticatedisbusiness = localStorage.getItem('account_type');

    const formatPrice = (price) => `₹${price.toFixed(2)}`;

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const userResponse = await api.get(`/api/user-details?locationId=${locationId}`, {
                    headers: { 'Authorization': `Bearer ${isAuthenticated}` },
                });

                const listedProducts = userResponse.data.business_account.listed_product || [];
                if (Array.isArray(listedProducts) && listedProducts.length) {
                    const productIds = listedProducts.map(item => item.product_id);
                    const response = await api.get(`/api/product/${productIds.join(',')}`);
                    setProducts(Array.isArray(response.data) ? response.data : [response.data]);
                } else {
                    setError('No products listed.');
                }
            } catch {
                setError('Failed to load products.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [isAuthenticated]);

    const handleUpdateProduct = (product) => {
        setSelectedProduct(product);
        setEditedProduct(product);
        setEditOpen(true);
    };

    const handleDeleteProduct = (product) => {
        setSelectedProduct(product);
        setConfirmationOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedProduct) {
            try {
                await api.delete(`/api/business/listed_product/${selectedProduct._id}`, {
                    headers: { Authorization: `Bearer ${isAuthenticated}`, account_type: isAuthenticatedisbusiness },
                });
                setProducts(products.filter(prod => prod._id !== selectedProduct._id));
            } catch (err) {
                console.error(err);
                setError('Failed to delete product.');
            } finally {
                setConfirmationOpen(false);
                setSelectedProduct(null);
            }
        }
    };

    const handleEditSubmit = async () => {
        try {
            await api.put(`/api/business/listed_product/${editedProduct._id}`, editedProduct, {
                headers: { Authorization: `Bearer ${isAuthenticated}`, account_type: isAuthenticatedisbusiness },
            });
            setProducts(products.map(prod => (prod._id === editedProduct._id ? editedProduct : prod)));
        } catch (err) {
            console.error(err);
            setError('Failed to update product.');
        } finally {
            setEditOpen(false);
            setSelectedProduct(null);
        }
    };

    const cancelDelete = () => {
        setConfirmationOpen(false);
        setSelectedProduct(null);
    };

    const handleEditChange = (e) => {
        setEditedProduct({ ...editedProduct, [e.target.name]: e.target.value });
    };

    if (loading) {
        return (
            <Box display="flex" flexWrap="wrap" justifyContent="center" padding={2}>
                {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} sx={{ margin: '10px', width: '300px', borderRadius: '10px', boxShadow: 2 }}>
                        <Skeleton height={200} />
                        <CardContent>
                            <Typography variant="h6">
                                <Skeleton width={150} />
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                <Skeleton width={100} />
                            </Typography>
                            <Skeleton width={80} height={20} />
                        </CardContent>
                        <Box display="flex" justifyContent="space-between" padding={1}>
                            <Skeleton width={100} height={40} />
                            <Skeleton width={100} height={40} />
                        </Box>
                    </Card>
                ))}
            </Box>
        );
    }

    if (error) return <div>{error}</div>;

    return (
        <>
            {products.length === 0 ? (
                <Typography variant="h6" textAlign="center">No products listed.</Typography>
            ) : (
                <Box display="flex" flexWrap="wrap" justifyContent="center" padding={2}>
                    {products.map((product) => (
                        <Card key={product._id} sx={{ margin: '10px', width: '300px', borderRadius: '10px', boxShadow: 2 }}>
                            <CardContent>
                                <Link to={`/product/${product._id}`}>
                                    <img src={product.image[0]?.img} alt={product.title} style={{ width: '100%', borderRadius: '10px' }} />
                                </Link>
                                <Typography variant="h6" sx={{ margin: '10px 0', fontWeight: 'bold' }}>
                                    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: '#333' }}>
                                        {product.title}
                                    </Link>
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {formatPrice(product.price)} - {product.stock} in stock
                                    {product.stock < 10 && <Typography color="error"> Stock is very low! Add some more.</Typography>}
                                </Typography>
                                <Box sx={{ '& > legend': { mt: 2 } }}>
                                    <Rating name="read-only" value={product.rating.rate} readOnly />
                                </Box>
                            </CardContent>
                            <Box display="flex" justifyContent="space-between" padding={1}>
                                <Button variant="contained" color="primary" onClick={() => handleUpdateProduct(product)}>Edit</Button>
                                <Button variant="contained" color="error" onClick={() => handleDeleteProduct(product)}>Delete</Button>
                            </Box>
                        </Card>
                    ))}
                </Box>
            )}

            <Dialog open={confirmationOpen} onClose={cancelDelete}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>Are you sure you want to delete this product?</DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete} color="primary">Cancel</Button>
                    <Button onClick={confirmDelete} color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Product Dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogContent>
                    {['title', 'price', 'description', 'category', 'sub_category', 'stock'].map(field => (
                        <TextField
                            key={field}
                            autoFocus={field === 'title'}
                            margin="dense"
                            name={field}
                            label={field.charAt(0).toUpperCase() + field.slice(1)}
                            fullWidth
                            value={editedProduct[field] || ''}
                            onChange={handleEditChange}
                            type={field === 'price' || field === 'stock' ? 'number' : 'text'}
                            multiline={field === 'description'}
                            rows={field === 'description' ? 4 : 1}
                        />
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)} color="primary">Cancel</Button>
                    <Button onClick={handleEditSubmit} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ProductList;
