import React, { useEffect } from 'react';

const HomePage = () => {
  useEffect(() => {
    document.title = 'Home Page';

    return () => {
      document.title = 'NexBuy';
    };
  }, []); 

  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the Home Page!</p>
    </div>
  );
};

export default HomePage;
