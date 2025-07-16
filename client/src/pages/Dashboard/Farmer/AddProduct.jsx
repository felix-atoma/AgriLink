import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from '../../../components/ui/Toast'
import AddProductForm from '../../../components/farmer/AddProductForm'
import apiClient from '../../../services/apiClient'
import handleApiError from '../../../utils/handleApiError';

const AddProduct = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleAddProduct = async (formData) => {
    try {
      const response = await apiClient.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(t('products.add_success'));
      navigate('/dashboard/farmer/my-products');
    } catch (error) {
      handleApiError(error, t('products.add_error'));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">{t('products.add_product')}</h2>
      <AddProductForm onSubmit={handleAddProduct} />
    </div>
  );
};

export default AddProduct;