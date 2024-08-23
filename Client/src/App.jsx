import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Loading from './components/Loading';
import Header from './components/Header';

// Lazy load your pages
const HomePage = lazy(() => import('./pages/HomePage'));


const App = () => {
  return (
    <div>
      <Header/>
      <main>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
