import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Slider from '@mui/material/Slider';
import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DefaultProduct from '../components/DefaultProduct';
import Skeleton from 'react-loading-skeleton';
import './css/CategoryPage.css';
import api from '../api';

const CategoryPage = () => {
  const { category, subcategory } = useParams();
  const [isPriceAscending, setIsPriceAscending] = useState(true);
  const [visibleContainer, setVisibleContainer] = useState(null);
  const [selectedSortOption, setSelectedSortOption] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [rating, setRating] = useState(0);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sliderMin, setSliderMin] = useState(0);
  const [sliderMax, setSliderMax] = useState(0);
  const [loading, setLoading] = useState(true);

  const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  useEffect(() => {
    document.title = `NexBuy - ${capitalizeFirstLetter(category)}`;
    return () => {
      document.title = 'NexBuy';
    };
  }, [category]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/all-product');
        const allProducts = response.data;

        const selectedProducts = allProducts.filter(
          (product) => product.category === category
        );
        
        const minPrice = Math.min(...selectedProducts.map(p => p.price));
        const maxPrice = Math.max(...selectedProducts.map(p => p.price));

        setPriceRange([minPrice, maxPrice]);
        setSliderMin(minPrice - 10);
        setSliderMax(maxPrice + 50);

        setProducts(selectedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, [category, subcategory]);

  useEffect(() => {
    let updatedProducts = [...products];

    updatedProducts = updatedProducts.filter(
      (product) => product.price >= (priceRange[0] - 10) && product.price <= (priceRange[1] + 20) && product.rating.rate >= rating
    );

    if (selectedSortOption === 'Price: highest to low') {
      updatedProducts.sort((a, b) => b.price - a.price);
    } else if (selectedSortOption === 'Price: low to highest') {
      updatedProducts.sort((a, b) => a.price - b.price);
    } else if (selectedSortOption === 'Newest') {
      updatedProducts.sort((a, b) => b.date - a.date);
    } else if (selectedSortOption === 'Customer review') {
      updatedProducts.sort((a, b) => b.rating.rate - a.rating.rate);
    } else if (selectedSortOption === 'Popular') {
      updatedProducts.sort((a, b) => b.totalbuys - a.totalbuys);
    }

    if (!selectedSortOption && isPriceAscending) {
      updatedProducts.sort((a, b) => a.price - b.price);
    } else if (!selectedSortOption && !isPriceAscending) {
      updatedProducts.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(updatedProducts);
  }, [products, priceRange, rating, selectedSortOption, isPriceAscending]);

  const togglePriceOrder = () => {
    setIsPriceAscending(!isPriceAscending);
  };

  const toggleContainer = (container) => {
    setVisibleContainer((prev) => (prev === container ? null : container));
  };

  const handleSortOptionClick = (option) => {
    setSelectedSortOption(option);
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  return (
    <div>
      <Header />
      <main>
        <div className="Sub-Catagory-Heading">
          <h1>
            <Link id='catagory-hh' to={`/catagory/${category}`}>
              {capitalizeFirstLetter(category)}
            </Link>
            <Link id='catagory-hh' to={`/catagory/${category}/${subcategory}`}>
              {subcategory && ` / ${capitalizeFirstLetter(subcategory)}`}
            </Link>
          </h1>
        </div>

        <div className="Filter-Section-Container">
          <span onClick={() => toggleContainer('filter')} style={{ cursor: 'pointer' }}>
            <i className="fa-solid fa-filter"></i> Filters
          </span>
          <span onClick={togglePriceOrder} style={{ cursor: 'pointer' }}>
            {isPriceAscending ? <i className="fa-solid fa-arrow-down-short-wide"></i> : <i className="fa-solid fa-arrow-up-short-wide"></i>}
            Price: {isPriceAscending ? 'lowest to high' : 'highest to low'}
          </span>
          <span className="sort-toggel-btn" onClick={() => toggleContainer('sort')} style={{ fontSize: "1.5rem", cursor: "pointer" }}>
            <i className="fa-brands fa-microsoft"></i>
          </span>
        </div>

        <div className={`sort-container ${visibleContainer === 'sort' ? 'visible' : ''}`}>
          <div className="sort-box-heading"><h2>Sort by</h2></div>
          <div className="sort-box-options">
            {['Popular', 'Newest', 'Customer review', 'Price: highest to low', 'Price: low to highest'].map((option) => (
              <span
                key={option}
                className={selectedSortOption === option ? 'selected' : ''}
                onClick={() => handleSortOptionClick(option)}
              >
                {option}
              </span>
            ))}
          </div>
        </div>

        <div className={`filter-container ${visibleContainer === 'filter' ? 'visible' : ''}`}>
          <div className="filter-box-heading"><h2>Filters</h2></div>
          <div className="filter-box-options">
            <div className="filter-option">
              <Typography gutterBottom>Price Range</Typography>
              <Slider
                style={{ color: "red" }}
                getAriaLabel={() => 'Price range'}
                value={priceRange}
                onChange={handlePriceRangeChange}
                valueLabelDisplay="auto"
                min={sliderMin}
                max={sliderMax}
                aria-labelledby="range-slider"
                getAriaValueText={(value) => `₹${value}`}
              />
              <div className="filter-value">
                <span>&#8377; {priceRange[0]}</span>
                <span>&#8377; {priceRange[1]}</span>
              </div>
            </div>
            <div className="filter-option">
              <Typography gutterBottom>Rating</Typography>
              <Box
                sx={{
                  '& > legend': { mt: 2 },
                }}
              >
                <Rating
                  style={{ color: "red" }}
                  name="rating"
                  value={rating}
                  onChange={(event, newValue) => setRating(newValue)}
                  size="large"
                />
              </Box>
            </div>
          </div>
        </div>

        <div className='product-container'>
          {loading ? (
            Array(10).fill().map((_, index) => (
              <div key={index} className="skeleton-wrapper">
                <Skeleton height={300} width={200} />
                <Skeleton width={150} />
                <Skeleton width={100} />
              </div>
            ))
          ) : filteredProducts.length === 0 ? (
            <p id='no-product'>No products available</p>
          ) : (
            filteredProducts.map((product) => (
              <DefaultProduct
                key={product._id}
                product={product}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default CategoryPage;
