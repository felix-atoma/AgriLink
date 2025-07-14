import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from '../../../components/shared/Spinner';
import apiClient from '../../../services/apiClient';

const EditProduct = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch product by ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await apiClient.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.put(`/products/${id}`, product);
      navigate('/dashboard/my-products');
    } catch (err) {
      setError(err?.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-600 text-sm">{error}</div>;
  if (!product) return <div>{t('products.notFound')}</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {t('common.edit')} {product.name}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('products.name')}
          </label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('products.price')}
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={product.price}
            onChange={(e) =>
              setProduct({ ...product, price: parseFloat(e.target.value) || 0 })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('products.quantity')}
          </label>
          <input
            type="number"
            min="0"
            value={product.quantity}
            onChange={(e) =>
              setProduct({ ...product, quantity: parseInt(e.target.value) || 0 })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        {/* Description (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('products.description')}
          </label>
          <textarea
            value={product.description || ''}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            placeholder={t('products.descriptionPlaceholder')}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
        >
          {submitting ? t('common.saving') : t('common.save')}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
