import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../utils/toast';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { success, error } = useToast(); // Destructure the specific methods you need

  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!product || !product._id) {
      error('Invalid product');
      return;
    }

    if (quantity < 1) {
      error('Quantity must be at least 1');
      return;
    }

    const productToAdd = {
      ...product,
      variantId: selectedVariant,
      variantName: selectedVariant,
    };

    addToCart(productToAdd, quantity);

    success(t('cart.added') || 'Product added to cart');
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white flex flex-col justify-between">
      <img
        src={product.images?.[0] || '/images/placeholder-product.jpg'}
        alt={product.name}
        className="w-full h-48 object-cover mb-3 rounded"
        onError={(e) => {
          e.target.src = '/images/placeholder-product.jpg';
        }}
      />

      <div>
        <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
        <p className="text-gray-600 mb-2">${product.price?.toFixed(2)}</p>

        {product.variants?.length > 0 && (
          <select
            className="mb-2 w-full border rounded px-2 py-1"
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
          >
            <option value="">{t('product.select_variant') || 'Select variant'}</option>
            {product.variants.map((variant) => (
              <option key={variant} value={variant}>
                {variant}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center justify-between">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-16 border rounded px-2 py-1"
          />

          <button
            onClick={handleAddToCart}
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full"
            aria-label="Add to cart"
          >
            <ShoppingCartIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;