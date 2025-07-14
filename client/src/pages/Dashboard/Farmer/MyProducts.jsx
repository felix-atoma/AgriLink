import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FarmerProductList from '../../../components/farmer/FarmerProductList';
import AddProductForm from '../../../components/farmer/AddProductForm';
import Spinner from '../../../components/shared/Spinner';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import apiClient from '../../../services/apiClient';

const MyProducts = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch farmer products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/products/my-products');
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add new product
  const handleAddProduct = async (productData) => {
    setFormLoading(true);
    try {
      const { data } = await apiClient.post('/products', productData);
      setProducts((prev) => [...prev, data]);
      setIsAddModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add product.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete a product
  const handleDeleteProduct = async (productId) => {
    try {
      await apiClient.delete(`/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete product.');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{t('farmer.my_products')}</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          {t('farmer.add_product')}
        </Button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-gray-600">{t('farmer.no_products')}</p>
      ) : (
        <FarmerProductList
          products={products}
          onEdit={(product) => console.log('Edit', product)} // Replace with actual edit logic
          onDelete={handleDeleteProduct}
        />
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('farmer.add_product')}
      >
        <AddProductForm onSubmit={handleAddProduct} loading={formLoading} />
      </Modal>
    </div>
  );
};

export default MyProducts;
