import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-medium text-gray-600 mb-6">
        {t('not_found.title')}
      </h2>
      <p className="text-gray-500 mb-8">{t('not_found.message')}</p>
      <Link
        to="/"
        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      >
        {t('not_found.go_home')}
      </Link>
    </div>
  );
};

export default NotFound;