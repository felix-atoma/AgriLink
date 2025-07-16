import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Input from '../ui/Input';
import Button from '../ui/Button';

const AddProductForm = ({ onSubmit, isLoading = false }) => {
  const { t } = useTranslation();
  const [locationMethod, setLocationMethod] = useState('manual'); // 'manual' or 'auto'
  const [locationError, setLocationError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm();

  const getCurrentLocation = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setValue('lat', position.coords.latitude);
          setValue('lng', position.coords.longitude);
        },
        (error) => {
          let errorMessage = t('products.location_error');
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = t('products.location_permission_denied');
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = t('products.location_unavailable');
              break;
            case error.TIMEOUT:
              errorMessage = t('products.location_timeout');
              break;
          }
          setLocationError(errorMessage);
          setLocationMethod('manual');
        }
      );
    } else {
      setLocationError(t('products.geolocation_not_supported'));
      setLocationMethod('manual');
    }
  };

  const handleFormSubmit = (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('category', data.category);
    formData.append('quantity', data.quantity);
    formData.append('lat', data.lat);
    formData.append('lng', data.lng);
    
    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]);
    }

    onSubmit(formData);
    reset();
    setCurrentLocation(null);
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
          {...register('description', { 
            required: t('validation.required'),
            minLength: {
              value: 10,
              message: t('validation.min_length', { count: 10 })
            }
          })}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('products.price')}
          id="price"
          type="number"
          step="0.01"
          {...register('price', {
            required: t('validation.required'),
            min: { value: 0.01, message: t('validation.min_price') },
            max: { value: 10000, message: t('validation.max_price') }
          })}
          error={errors.price}
        />

        <Input
          label={t('products.quantity')}
          id="quantity"
          type="number"
          {...register('quantity', {
            required: t('validation.required'),
            min: { value: 1, message: t('validation.min_quantity') },
            max: { value: 1000, message: t('validation.max_quantity') }
          })}
          error={errors.quantity}
        />
      </div>

      <Input
        label={t('products.category')}
        id="category"
        {...register('category', { required: t('validation.required') })}
        error={errors.category}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {t('products.location_method')}
        </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="locationMethod"
              checked={locationMethod === 'manual'}
              onChange={() => setLocationMethod('manual')}
            />
            <span className="ml-2">{t('products.enter_manually')}</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="locationMethod"
              checked={locationMethod === 'auto'}
              onChange={() => {
                setLocationMethod('auto');
                getCurrentLocation();
              }}
            />
            <span className="ml-2">{t('products.use_current_location')}</span>
          </label>
        </div>
      </div>

      {locationMethod === 'manual' && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('products.latitude')}
            id="lat"
            type="number"
            step="0.000001"
            {...register('lat', { 
              required: t('validation.required'),
              min: { value: -90, message: t('validation.invalid_latitude') },
              max: { value: 90, message: t('validation.invalid_latitude') }
            })}
            error={errors.lat}
          />
          <Input
            label={t('products.longitude')}
            id="lng"
            type="number"
            step="0.000001"
            {...register('lng', { 
              required: t('validation.required'),
              min: { value: -180, message: t('validation.invalid_longitude') },
              max: { value: 180, message: t('validation.invalid_longitude') }
            })}
            error={errors.lng}
          />
        </div>
      )}

      {locationMethod === 'auto' && (
        <div>
          {currentLocation ? (
            <p className="text-green-600 text-sm">
              {t('products.location_found')}: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </p>
          ) : (
            <p className="text-yellow-600 text-sm">
              {locationError || t('products.getting_location')}
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          {t('products.image')}
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          {...register('image', { 
            required: t('validation.required'),
            validate: {
              lessThan10MB: files => 
                files[0]?.size < 10000000 || t('validation.file_too_large'),
              acceptedFormats: files =>
                ['image/jpeg', 'image/png', 'image/webp'].includes(files[0]?.type) || 
                t('validation.invalid_image_format')
            }
          })}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {errors.image && (
          <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? t('products.creating') : t('products.add_product')}
      </Button>
    </form>
  );
};

export default AddProductForm;