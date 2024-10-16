import React, { useState, useEffect } from 'react';
import './css/AdSliderContainer.css';

const images = [
  '/ad_poster/poster1.png',
  '/ad_poster/poster2.png',
  '/ad_poster/poster3.png',
  '/ad_poster/poster4.png',
  '/ad_poster/poster5.png',
];

const AdSliderContainer = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Function to go to the next slide
  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
  };

  // Function to go to the previous slide
  const prevSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? images.length - 1 : prevSlide - 1
    );
  };

  // Function to go to a specific slide
  const selectSlide = (index) => {
    setCurrentSlide(index);
  };

  // Set up automatic slide change
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className='Ads-slider-container'>
      {/* Left button */}
      <button
        className={`slider-btn left ${currentSlide === 0 ? 'hidden' : ''}`}
        onClick={prevSlide}
      >
        &#10094; {/* Left arrow */}
      </button>

      {/* Slider wrapper */}
      <div className='slider-wrapper' style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {/* Slide images */}
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Slide ${index + 1}`}
            className='slider-image'
          />
        ))}
      </div>

      {/* Right button */}
      <button
        className={`slider-btn right ${currentSlide === images.length - 1 ? 'hidden' : ''}`}
        onClick={nextSlide}
      >
        &#10095; {/* Right arrow */}
      </button>

      <div className='slider-radio'>
        {images.map((_, index) => (
          <React.Fragment key={index}>
            <input
              type='radio'
              id={`radio${index}`}
              name='slider-radio'
              checked={currentSlide === index}
              onChange={() => selectSlide(index)}
            />
            <label htmlFor={`radio${index}`}></label>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AdSliderContainer;
