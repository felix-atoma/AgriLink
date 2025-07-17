import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../../components/shared/Spinner';
import apiClient from '../../../services/apiClient';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyProducts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
        const response = await apiClient.get('/products/my-products');
      
      // Handle different response structures
      let productsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          productsData = response.data;
        } else if (Array.isArray(response.data.products)) {
          productsData = response.data.products;
        } else if (response.data.success && Array.isArray(response.data.data)) {
          productsData = response.data.data;
        }
      }

      if (productsData.length === 0) {
        // No error for empty array - just display empty state
        setProducts([]);
      } else {
        setProducts(productsData);
      }
      
    } catch (err) {
      console.error('Fetch products error:', err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         t('errors.fetchFailed');
      setError(errorMessage);
      setProducts([]);
      
      // Don't show error toast for empty products (404 might be normal)
      if (!err.response || err.response.status !== 404) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [t]);

 const handleDelete = async (productId) => {
  if (!window.confirm('Are you sure you want to delete this product?')) return;

  try {
    setDeletingId(productId);
    await apiClient.delete(`/products/${productId}`); // ✅ Corrected path
    setProducts(products.filter(p => p._id !== productId));
    toast.success('Product deleted successfully');
  } catch (err) {
    console.error('Delete product error:', err);
    toast.error(err.response?.data?.message || 'Delete failed');
  } finally {
    setDeletingId(null);
  }
};


  const handleEdit = (productId) => {
    navigate(`/dashboard/farmer/edit-product/${productId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
        <h2 className="text-xl text-red-600 mb-4">{error}</h2>
        <div className="flex space-x-3">
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t('common.retry')}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            {t('common.backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('myProducts.title')}</h1>
        <button
          onClick={() => navigate('/dashboard/farmer/add-product')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          {t('myProducts.addProduct')}
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg mb-4">{t('myProducts.noProducts')}</p>
          <button
            onClick={() => navigate('/dashboard/farmer/add-product')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {t('myProducts.addFirstProduct')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div 
              key={product._id}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <div className="relative h-48 bg-gray-100">
                {product.images?.[0]?.url ? (
                  <img 
                    src={product.images[0].url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    {product.name}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg">${product.price?.toFixed(2)}</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product._id)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={deletingId === product._id}
                    className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                      deletingId === product._id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {deletingId === product._id ? t('common.deleting') : t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;