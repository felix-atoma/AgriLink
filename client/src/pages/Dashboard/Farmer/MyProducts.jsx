import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../../components/shared/Spinner';
import apiClient from '../../../services/apiClient';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../../components/ui/Toast';

const MyProducts = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        if (!isMounted) return;
        
        setLoading(true);
        setError(null);
        
        const response = await apiClient.get('/products/farmer/my-products', {
          signal: controller.signal
        });
        
        if (!isMounted) return;
        
        if (!response.data) {
          throw new Error(t('errors.noProductsFound') || 'No products found');
        }

        setProducts(response.data);
      } catch (err) {
        if (!isMounted) return;
        
        console.error('Fetch products error:', err);
        
        // Only show error if it's not an abort error
        if (err.name !== 'AbortError') {
          setError(err.message);
          
          // Limit retries to 3 attempts
          if (retryCount < 3) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 2000);
          } else {
            toast({
              variant: "destructive",
              title: t('errors.fetchFailed'),
              description: err.response?.data?.message || err.message,
            });
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [retryCount, toast, t]);

  if (loading && retryCount === 0) return <Spinner />;

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
        <h2 className="text-xl text-red-600 mb-4">{error}</h2>
        {retryCount < 3 ? (
          <p className="text-gray-500">Retrying... ({retryCount}/3)</p>
        ) : (
          <>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded mr-2"
            >
              {t('common.reload')}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              {t('common.backToDashboard')}
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('myProducts.title')}</h1>
        <button
          onClick={() => navigate('/dashboard/farmer/add-product')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {t('myProducts.addProduct')}
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">{t('myProducts.noProducts')}</p>
          <button
            onClick={() => navigate('/dashboard/farmer/add-product')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t('myProducts.addFirstProduct')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <ProductCard 
              key={product._id}
              product={product}
              onEdit={() => navigate(`/dashboard/farmer/edit-product/${product._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ product, onEdit }) => (
  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
    <h3 className="font-semibold text-lg">{product.name}</h3>
    <p className="text-gray-600 text-sm mt-1">{product.description}</p>
    <div className="mt-3 flex justify-between items-center">
      <span className="font-bold">${product.price?.toFixed(2)}</span>
      <span className="text-sm">Qty: {product.quantity}</span>
    </div>
    <div className="mt-4 flex space-x-2">
      <button
        onClick={onEdit}
        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
      >
        Edit
      </button>
      <button
        onClick={() => handleDelete(product._id)}
        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
      >
        Delete
      </button>
    </div>
  </div>
);

export default MyProducts;