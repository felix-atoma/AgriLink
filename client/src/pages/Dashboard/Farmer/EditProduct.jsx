import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '../../../components/shared/Spinner';
import apiClient from '../../../services/apiClient';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../../components/ui/Toast';
import { isValidObjectId } from '../../../utils/validators';

const EditProduct = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: '',
    price: '',
    quantity: '',
    description: '',
    category: 'general',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        if (!isMounted) return;

        // Validate product ID first
        if (!productId || !isValidObjectId(productId)) {
          throw new Error(t('errors.invalidProductId') || 'Invalid product ID');
        }

        const response = await apiClient.get(`/products/${productId}`);
        
        if (!isMounted) return;
        
        if (!response.data) {
          throw new Error(t('errors.productNotFound') || 'Product not found');
        }

        setProduct({
          name: response.data.name || '',
          price: response.data.price?.toString() || '0',
          quantity: response.data.quantity?.toString() || '0',
          description: response.data.description || '',
          category: response.data.category || 'general',
        });

      } catch (err) {
        if (!isMounted) return;
        
        console.error('Fetch error:', err);
        setErrors({ fetch: err.message });
        
        // Delay toast to prevent potential loops
        setTimeout(() => {
          toast({
            variant: "destructive",
            title: t('errors.fetchFailed'),
            description: err.response?.data?.message || err.message,
          });
        }, 100);
        
        navigate('/dashboard/farmer/my-products');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Only fetch if we have a valid productId
    if (productId && isValidObjectId(productId)) {
      fetchProduct();
    } else {
      setLoading(false);
      setErrors({ fetch: t('errors.invalidProductId') || 'Invalid product ID' });
      navigate('/dashboard/farmer/my-products');
    }

    return () => {
      isMounted = false;
    };
  }, [productId, navigate, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      // Validate all required fields
      const requiredFields = ['name', 'description', 'price', 'quantity'];
      const missingFields = requiredFields.filter(field => !product[field]);
      
      if (missingFields.length > 0) {
        throw new Error(t('errors.missingFields') || 'Please fill all required fields');
      }

      // Convert to proper types
      const payload = {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        quantity: parseInt(product.quantity),
        category: product.category,
      };

      // Make the API call
      await apiClient.put(`/products/${productId}`, payload);
      
      // Show success message
      toast({
        title: t('product.updateSuccess'),
        description: t('product.updatedSuccessfully'),
      });
      
      // Redirect after successful update
      navigate('/dashboard/farmer/my-products');

    } catch (err) {
      console.error('Update error:', err);
      
      // Handle validation errors from server
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
      
      // Show error message
      toast({
        variant: "destructive",
        title: t('errors.updateFailed'),
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  if (errors.fetch) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
        <h2 className="text-xl text-red-600 mb-4">{errors.fetch}</h2>
        <button
          onClick={() => navigate('/dashboard/farmer/my-products')}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          {t('common.backToProducts')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">
        {t('common.edit')} {product.name}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block mb-1 font-medium">{t('product.name')}</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded ${errors.name ? 'border-red-500' : ''}`}
            required
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Price Field */}
        <div>
          <label className="block mb-1 font-medium">{t('product.price')}</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={`w-full border px-3 py-2 rounded ${errors.price ? 'border-red-500' : ''}`}
            required
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>

        {/* Quantity Field */}
        <div>
          <label className="block mb-1 font-medium">{t('product.quantity')}</label>
          <input
            type="number"
            name="quantity"
            value={product.quantity}
            onChange={handleChange}
            min="0"
            className={`w-full border px-3 py-2 rounded ${errors.quantity ? 'border-red-500' : ''}`}
            required
          />
          {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
        </div>

        {/* Description Field */}
        <div>
          <label className="block mb-1 font-medium">{t('product.description')}</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            rows="4"
            className={`w-full border px-3 py-2 rounded ${errors.description ? 'border-red-500' : ''}`}
            required
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Category Field */}
        <div>
          <label className="block mb-1 font-medium">{t('product.category')}</label>
          <select
            name="category"
            value={product.category}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded ${errors.category ? 'border-red-500' : ''}`}
          >
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="dairy">Dairy</option>
            <option value="meat">Meat</option>
            <option value="grains">Grains</option>
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        {/* Form Actions */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/farmer/my-products')}
            className="flex-1 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={submitting}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`flex-1 py-2 rounded text-white ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {submitting ? t('common.saving') + '...' : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;