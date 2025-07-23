import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const AddProductForm = ({ farmerId }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    lat: '',
    lng: '',
    images: [],
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});

  // Cloudinary configuration
  const CLOUD_NAME = 'dbjjbxazd';
  const UPLOAD_PRESET = 'ml_default';

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t('validation.required');
    if (!formData.description.trim()) newErrors.description = t('validation.required');
    if (!formData.price) newErrors.price = t('validation.required');
    if (formData.price <= 0) newErrors.price = t('validation.invalidPrice');
    if (!formData.quantity) newErrors.quantity = t('validation.required');
    if (formData.quantity < 0) newErrors.quantity = t('validation.invalidQuantity');
    if (!formData.category.trim()) newErrors.category = t('validation.required');
    if (!formData.lat) newErrors.lat = t('validation.required');
    if (!formData.lng) newErrors.lng = t('validation.required');
    if (!formData.images.length) newErrors.image = t('validation.required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      toast.error(t('addProductForm.imageValidation'));
      return;
    }

    if (file.size > maxSize) {
      toast.error(t('addProductForm.sizeValidation'));
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);

    try {
      const formDataImage = new FormData();
      formDataImage.append('file', file);
      formDataImage.append('upload_preset', UPLOAD_PRESET);
      formDataImage.append('cloud_name', CLOUD_NAME);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formDataImage,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || t('addProductForm.uploadError'));
      }

      const data = await res.json();

      setFormData((prev) => ({
        ...prev,
        images: [
          {
            url: data.secure_url,
            publicId: data.public_id,
          },
        ],
      }));
    } catch (err) {
      console.error('Image upload error:', err);
      toast.error(`${t('addProductForm.uploadFailed')}: ${err.message}`);
      setSelectedImage(null);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error(t('addProductForm.formErrors'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        farmer: farmerId || undefined,
      };

      const token = localStorage.getItem('token');

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || t('addProductForm.createError'));

      toast.success(t('addProductForm.addSuccess'));
      
      setFormData({
        name: '',
        description: '',
        price: '',
        quantity: '',
        category: '',
        lat: '',
        lng: '',
        images: [],
      });
      setSelectedImage(null);
      setImagePreview(null);
      setErrors({});
    } catch (err) {
      console.error('Product creation error:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg space-y-6"
    >
      <h2 className="text-3xl font-semibold text-gray-800">{t('addProductForm.title')}</h2>

      {[
        ['name', t('addProductForm.productName'), 'text'],
        ['description', t('addProductForm.productDescription'), 'textarea'],
        ['category', t('addProductForm.productCategory'), 'text'],
      ].map(([key, label, type]) => (
        <div key={key}>
          <label htmlFor={key} className="block font-medium text-gray-700 mb-1">
            {label}*
          </label>
          {type === 'textarea' ? (
            <textarea
              id={key}
              name={key}
              value={formData[key]}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          ) : (
            <input
              id={key}
              name={key}
              type={type}
              value={formData[key]}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          )}
          {errors[key] && <p className="text-red-600 text-sm mt-1">{errors[key]}</p>}
        </div>
      ))}

      <div className="grid grid-cols-2 gap-4">
        {[
          ['price', t('addProductForm.productPrice'), 'number', '0.01'],
          ['quantity', t('addProductForm.productQuantity'), 'number', '1'],
        ].map(([key, label, type, step]) => (
          <div key={key}>
            <label className="block font-medium text-gray-700 mb-1">{label}*</label>
            <input
              name={key}
              type={type}
              step={step}
              min="0"
              value={formData[key]}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {errors[key] && <p className="text-red-600 text-sm mt-1">{errors[key]}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          ['lat', t('addProductForm.latitude'), 'number', 'any'],
          ['lng', t('addProductForm.longitude'), 'number', 'any'],
        ].map(([key, label, type, step]) => (
          <div key={key}>
            <label className="block font-medium text-gray-700 mb-1">{label}*</label>
            <input
              name={key}
              type={type}
              step={step}
              value={formData[key]}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {errors[key] && <p className="text-red-600 text-sm mt-1">{errors[key]}</p>}
          </div>
        ))}
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">
          {t('addProductForm.productImage')}*
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={uploadingImage}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0 file:text-sm file:font-semibold
            file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {uploadingImage && (
          <p className="text-sm text-gray-500 mt-1">{t('addProductForm.uploadingImage')}</p>
        )}
        {imagePreview && (
          <div className="mt-3">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full max-h-60 object-contain rounded-md border"
            />
            <p className="text-sm text-gray-500 mt-1">{selectedImage?.name}</p>
          </div>
        )}
        {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
      </div>

      <button
        type="submit"
        disabled={loading || uploadingImage}
        className={`w-full py-3 text-white rounded-md font-semibold transition-colors ${
          loading || uploadingImage
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-amber-500 hover:bg-amber-600'
        }`}
      >
        {loading
          ? t('addProductForm.creatingProduct')
          : uploadingImage
          ? t('addProductForm.uploadingImage')
          : t('addProductForm.createProduct')}
      </button>
    </form>
  );
};

export default AddProductForm;