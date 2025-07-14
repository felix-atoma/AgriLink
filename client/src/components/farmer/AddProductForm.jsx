import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Input from '../ui/Input';
import Button from '../ui/Button';

const AddProductForm = ({ onSubmit }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const handleFormSubmit = (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('category', data.category);
    formData.append('quantity', data.quantity);
    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]);
    }

    onSubmit(formData);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4"
      encType="multipart/form-data"
    >
      <Input
        label={t('products.name')}
        id="name"
        {...register('name', { required: t('validation.required') })}
        error={errors.name}
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          {t('products.description')}
        </label>
        <textarea
          id="description"
          rows={3}
          className="w-full border rounded p-2"
          {...register('description', { required: t('validation.required') })}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <Input
        label={t('products.price')}
        id="price"
        type="number"
        step="0.01"
        {...register('price', {
          required: t('validation.required'),
          min: { value: 0.01, message: t('validation.min_price') }
        })}
        error={errors.price}
      />

      <Input
        label={t('products.quantity')}
        id="quantity"
        type="number"
        {...register('quantity', {
          required: t('validation.required'),
          min: { value: 1, message: t('validation.min_quantity') }
        })}
        error={errors.quantity}
      />

      <Input
        label={t('products.category')}
        id="category"
        {...register('category', { required: t('validation.required') })}
        error={errors.category}
      />

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          {t('products.image')}
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          {...register('image', { required: t('validation.required') })}
        />
        {errors.image && (
          <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        {t('products.add_product')}
      </Button>
    </form>
  );
};

export default AddProductForm;
