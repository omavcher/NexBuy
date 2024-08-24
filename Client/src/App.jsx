import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Loading from './components/Loading';
import Header from './components/Header';
import SignUpPage from './pages/SignUpPage';

// Lazy load your pages
const HomePage = lazy(() => import('./pages/HomePage'));


const App = () => {
  return (
    <div>
      <main>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
