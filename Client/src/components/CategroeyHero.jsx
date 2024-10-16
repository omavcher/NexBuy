import React from 'react'
import './css/CategroeyHero.css'
import api from '../api.js';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';

export default function CategroeyHero() {
  return (
    <div className='top-cata-container'>
      <header>      
          <h2>Shop From <span>Top categories</span></h2>
      </header>
      <section>

      <Link to={`/catagory/electronics/phones`} className='catag-box'>
        <img src='/cata_png/mobile.png' alt='mobile'></img>
        <h1>Mobile</h1>
      </Link>



      <Link to={`/catagory/beauty`} className='catag-box'>
        <img src='/cata_png/cosmetics.png' alt='cosmetics'></img>
        <h1>Cosmetics</h1>
      </Link>


      
      <Link to={`/catagory/electronics/smartwatch`} className='catag-box'>
        <img src='/cata_png/smartwatch.png' alt='smartwatch'></img>
        <h1>Smart Watch</h1>
      </Link>


      
      <Link to={`/catagory/apparel`} className='catag-box'>
        <img src='/cata_png/clothes.png' alt='clothes'></img>
        <h1>Clothes</h1>
      </Link>


      </section>
    </div>
  )
}
