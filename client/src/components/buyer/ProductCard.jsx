import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../utils/toast';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { success, error } = useToast();

  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0] || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    try {
      if (!product?._id) {
        error(t('products:product.invalid') || 'Invalid product');
        return;
      }

      if (quantity < 1 || quantity > 100) {
        error(t('products:cart.invalid_quantity') || 'Quantity must be between 1-100');
        return;
      }

      if (product.variants?.length > 0 && !selectedVariant) {
        error(t('products:product.select_variant') || 'Please select a variant');
        return;
      }

      addToCart({
        ...product,
        variantId: selectedVariant,
        variantName: selectedVariant,
      }, quantity);

      success(t('products:cart.added') || 'Product added to cart');
    } catch (err) {
      error(t('products:cart.error') || 'Failed to add to cart');
    }
  };

  // Generate proper Cloudinary URL with transformations
  const getImageUrl = () => {
    if (imageError) return '/images/placeholder-product.svg';
    
    if (!product.images?.[0]) return '/images/placeholder-product.svg';

    // Handle different image data structures
    let imageUrl = '';
    
    // If image is an object with url property
    if (typeof product.images[0] === 'object' && product.images[0].url) {
      imageUrl = product.images[0].url;
    } 
    // If image is a string
    else if (typeof product.images[0] === 'string') {
      imageUrl = product.images[0];
    }
    else {
      return '/images/placeholder-product.svg';
    }

    // If already a full URL (Cloudinary or otherwise)
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // If stored as Cloudinary public ID, construct URL
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    if (cloudName) {
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_300,c_fill,q_auto/${imageUrl}`;
    }


  };

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="relative aspect-square mb-3">
        <img
          src={getImageUrl()}
          alt={product.name}
          className="w-full h-full object-cover rounded"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>

      <div className="flex flex-col flex-grow">
        <h2 className="text-lg font-semibold text-gray-800 line-clamp-2">
          {product.name}
        </h2>
        <p className="text-gray-600 mb-2 mt-1">
          ${product.price?.toFixed(2)}
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through ml-2">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </p>

        {product.variants?.length > 0 && (
          <select
            className="mb-2 w-full border rounded px-2 py-1 text-sm"
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
            required
          >
            <option value="">{t('products:product.select_variant')}</option>
            {product.variants.map((variant) => (
              <option key={variant} value={variant}>
                {variant}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <input
            type="number"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => {
              const val = Math.min(100, Math.max(1, Number(e.target.value) || 1));
              setQuantity(val);
            }}
            className="w-16 border rounded px-2 py-1 text-center"
          />

          <button
            onClick={handleAddToCart}
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-colors"
            aria-label={t('products:cart.add')}
            disabled={product.stock <= 0}
          >
            <ShoppingCartIcon className="w-5 h-5" />
          </button>
        </div>
        {product.stock <= 0 && (
          <p className="text-red-500 text-xs mt-1">
            {t('products:product.out_of_stock')}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;