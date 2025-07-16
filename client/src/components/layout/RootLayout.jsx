import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Footer from './Footer';
import ErrorBoundary from './ErrorBoundary';

const RootLayout = () => {
  const { t, ready } = useTranslation();

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-semibold">
        {t('loading') || 'Loading...'}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <ErrorBoundary>
        {/* Wrap Navbar in try/catch to avoid context errors during SSR or early mount */}
        <React.Suspense fallback={<div className="p-4">Loading Navbar...</div>}>
          <Navbar />
        </React.Suspense>

        <main className="flex-grow px-4 py-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        <Footer year={new Date().getFullYear()} />
      </ErrorBoundary>
    </div>
  );
};

export default RootLayout;
