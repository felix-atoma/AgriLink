import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../../services/apiClient";

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
    lat: "",
    lng: "",
    images: [],
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});

  // Cloudinary configuration
  const CLOUD_NAME = "dbjjbxazd";
  const UPLOAD_PRESET = "ml_default";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/products/my-products");

        if (!response.data) {
          throw new Error("Product not found");
        }

        const product = response.data;
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          quantity: product.quantity?.toString() || "",
          category: product.category || "",
          lat: product.location?.coordinates?.[1]?.toString() || "",
          lng: product.location?.coordinates?.[0]?.toString() || "",
          images: product.images || [],
        });

        if (product.images?.[0]?.url) {
          setImagePreview(product.images[0].url);
        }
      } catch (err) {
        console.error("Fetch product error:", err);
        toast.error(
          err.response?.data?.message || "Failed to load product data"
        );
        navigate("/dashboard/farmer/my-products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (Number(formData.price) <= 0)
      newErrors.price = "Price must be greater than 0";
    if (!formData.quantity) newErrors.quantity = "Quantity is required";
    if (Number(formData.quantity) < 0)
      newErrors.quantity = "Quantity cannot be negative";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.lat) newErrors.lat = "Latitude is required";
    if (!formData.lng) newErrors.lng = "Longitude is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed");
      return;
    }

    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);

    try {
      const formDataImage = new FormData();
      formDataImage.append("file", file);
      formDataImage.append("upload_preset", UPLOAD_PRESET);
      formDataImage.append("cloud_name", CLOUD_NAME);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formDataImage,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Cloudinary upload failed");
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
      console.error("Image upload error:", err);
      toast.error(`Image upload failed: ${err.message}`);
      setSelectedImage(null);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the form errors");
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
      };

      const response = await apiClient.put(
        `/products/${productId}`, 
        payload
      );
      toast.success("Product updated successfully!");
      navigate("/dashboard/farmer/my-products");
    } catch (err) {
      console.error("Update product error:", err);
      toast.error(err.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.name) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg space-y-6"
    >
      <h2 className="text-3xl font-semibold text-gray-800">Edit Product</h2>

      {[
        ["name", "Product Name*", "text"],
        ["description", "Description*", "textarea"],
        ["category", "Category*", "text"],
      ].map(([key, label, type]) => (
        <div key={key}>
          <label htmlFor={key} className="block font-medium text-gray-700 mb-1">
            {label}
          </label>
          {type === "textarea" ? (
            <textarea
              id={key}
              name={key}
              value={formData[key]}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ) : (
            <input
              id={key}
              name={key}
              type={type}
              value={formData[key]}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
          {errors[key] && (
            <p className="text-red-600 text-sm mt-1">{errors[key]}</p>
          )}
        </div>
      ))}

      <div className="grid grid-cols-2 gap-4">
        {[
          ["price", "Price*", "number", "0.01"],
          ["quantity", "Quantity*", "number", "1"],
        ].map(([key, label, type, step]) => (
          <div key={key}>
            <label className="block font-medium text-gray-700 mb-1">
              {label}
            </label>
            <input
              name={key}
              type={type}
              step={step}
              min="0"
              value={formData[key]}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors[key] && (
              <p className="text-red-600 text-sm mt-1">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          ["lat", "Latitude*", "number", "any"],
          ["lng", "Longitude*", "number", "any"],
        ].map(([key, label, type, step]) => (
          <div key={key}>
            <label className="block font-medium text-gray-700 mb-1">
              {label}
            </label>
            <input
              name={key}
              type={type}
              step={step}
              value={formData[key]}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors[key] && (
              <p className="text-red-600 text-sm mt-1">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Product Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={uploadingImage}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0 file:text-sm file:font-semibold
            file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {uploadingImage && (
          <p className="text-sm text-gray-500 mt-1">Uploading image...</p>
        )}
        {imagePreview && (
          <div className="mt-3">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full max-h-60 object-contain rounded-md border"
            />
            {selectedImage && (
              <p className="text-sm text-gray-500 mt-1">{selectedImage.name}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => navigate("/dashboard/farmer/my-products")}
          className="flex-1 py-3 bg-gray-300 text-gray-800 rounded-md font-semibold hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className={`flex-1 py-3 text-white rounded-md font-semibold transition-colors ${
            loading || uploadingImage
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading
            ? "Updating..."
            : uploadingImage
            ? "Uploading Image..."
            : "Update Product"}
        </button>
      </div>
    </form>
  );
};

export default EditProduct;
