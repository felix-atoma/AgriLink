import React from 'react';
import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';
import Spinner from '../shared/Spinner';

const ProductList = ({ products = [], loading = false, emptyMessage = '' }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <img
          src="/images/empty-box.svg"
          alt="No results"
          className="h-32 w-32 mb-4 opacity-50"
        />
        <p className="text-gray-500 text-lg font-medium">
          {emptyMessage || t('common.noResults')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id || product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
