import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../context/CartContext';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    await addToCart(product._id); // Optionally show toast here
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <Link to={`/products/${product._id}`} className="block">
        <div className="h-48 bg-gray-100 overflow-hidden">
          <img
            src={product.images?.[0] || '/images/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-primary-600 transition">
            {product.name}
          </h3>
        </Link>

        {product.farmer?.farmName && (
          <div className="flex items-center text-sm text-gray-600 mt-1 mb-2">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span>{product.farmer.farmName}</span>
          </div>
        )}

        <p className="text-gray-500 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-primary-600">
            ${product.price.toFixed(2)}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="p-2"
            onClick={handleAddToCart}
          >
            <ShoppingCartIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
