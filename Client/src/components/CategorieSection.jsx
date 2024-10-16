import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import './css/CategorieSection.css'



const categories = [
    {
      name: 'Grocery',
      products: [
        { name: 'Breads & Buns', link: '/catagory/grocery/breads', image: '/catagory/Breads.png' },
        { name: 'Fruits & Vegetables', link: '/catagory/grocery/vegetables', image: '/catagory/vegetables.png' },
        { name: 'Beverages', link: '/catagory/grocery/beverages', image: '/catagory/Beverages.png' },
        { name: 'Foodgrains, Oil & Masala', link: '/catagory/grocery/foodgrains', image: '/catagory/Foodgrains.png' }
      ]
    },
    {
      name: 'Electronics',
      products: [
        { name: 'Laptops', link: '/catagory/electronics/laptops', image: '/catagory/Laptop.png' },
        { name: 'Phones', link: '/catagory/electronics/phones', image: '/catagory/Phone.png' },
        { name: 'Refrigerator', link: '/catagory/electronics/refrigerator', image: '/catagory/Refrigerator.png' },
        { name: 'Smart Watch', link: '/catagory/electronics/smartwatch', image: '/catagory/SmartWatch.png' },
        { name: 'Air Conditioner', link: '/catagory/electronics/air_conditioner', image: '/catagory/AirConditioner.png' },
        { name: 'Television', link: '/catagory/electronics/television', image: '/catagory/Television.png' }
      ]
    },
    {
      name: 'Beauty',
      products: [
        { name: 'Bath & Hand Wash', link: '/catagory/beauty/bath-hand-wash', image: '/catagory/BathHandWash.png' },
        { name: 'Fragrances & Deos', link: '/catagory/beauty/fragrances-deos', image: '/catagory/FragrancesDeos.png' },
        { name: 'Hair Care', link: '/catagory/beauty/haircare', image: '/catagory/HairCare.png' }
      ]
    },
    {
      name: 'Apparel',
      products: [
        { name: "Boy's Wear", link: '/catagory/apparel/boys-wear', image: '/catagory/Boys-wear.png' },
        { name: "Girl's Wear", link: '/catagory/apparel/girl-wear', image: '/catagory/Girl-wear.png' }
      ]
    },
    {
      name: 'Attractive Deals',
      products: [
        { name: 'Home Appliances', link: '/catagory/attractive-deals/home-appliances', image: '/catagory/home-appliances.png' },
        { name: 'Kitchen', link: '/catagory/attractive-deals/kitchen', image: '/catagory/kitchen.png' },
        { name: 'Sports & Fitness', link: '/catagory/attractive-deals/sports-fitness', image: '/catagory/sports-fitness.png' }
      ]
    }
  ];
  
export default function CategorieSection() {
    const [selectedCategory, setSelectedCategory] = useState('');
  const [isDropdownVisible, setDropdownVisible] = useState('');

  const handleCategoryClick = (category) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
    setDropdownVisible(selectedCategory === category ? '' : category);
  };

  return (
    <div className='catagory-tab-container'>
          {categories.map((category) => (
            <div key={category.name}>
              <span
                id={selectedCategory === category.name ? 'selected' : ''}
                onClick={() => handleCategoryClick(category.name)}
              >
                {category.name} <i className={`fa-solid ${selectedCategory === category.name ? 'fa-caret-up' : 'fa-caret-down'}`}></i>
              </span>

              {isDropdownVisible === category.name && (
                <div className={`catagory-tab ${isDropdownVisible === category.name ? 'fade-in' : 'fade-out'}`}>
                  {category.products.map((product) => (
                    <Link key={product.name} id='catagory-btn' to={product.link}>
                      <div className='catagory-product'>
                        {product.name} <img src={product.image} alt={product.name} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
  )
}
