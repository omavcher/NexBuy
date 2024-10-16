import React, { useState } from 'react';
import Header from '../components/Header';
import './css/HomePage.css';
import { Link } from 'react-router-dom';
import AdSliderContainer from '../components/AdSliderContainer';
import CategorieSection from '../components/CategorieSection';
import PrroductHero from '../components/PrroductHero';
import CategroeyHero from '../components/CategroeyHero';


const HomePage = () => {

  return (
    <div>
      <Header />
      <main>
        <CategorieSection/>
        <AdSliderContainer/>
        <PrroductHero category="electronics"/>
        <CategroeyHero/>
        <PrroductHero category="beauty"/>

      </main>
    </div>
  );
};

export default HomePage;
