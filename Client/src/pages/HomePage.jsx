import React, { useEffect } from 'react';
import Header from '../components/Header';

const HomePage = () => {
  useEffect(() => {
    document.title = 'Home Page';

    return () => {
      document.title = 'NexBuy';
    };
  }, []); 

  return (
    <div>
      <Header/>
      
      <main>
      <h1>Home Page</h1>
      <p>Welcome to the Home Page!</p>
      </main>

    </div>
  );
};

export default HomePage;
