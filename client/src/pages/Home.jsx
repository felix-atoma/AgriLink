import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProductList from '../components/buyer/ProductList';
import Spinner from '../components/shared/Spinner';
import apiClient from '../services/apiClient';

const PRODUCTS_PER_PAGE = 6;

const Home = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await apiClient.get('/products');
        const productsArray = data.data || []; // ✅ Extract the array
        setProducts(productsArray);
        setFiltered(productsArray);
        const uniqueCategories = [...new Set(productsArray.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (err) {
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter by search + category
  useEffect(() => {
    let result = [...products];
    if (searchTerm) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }
    setFiltered(result);
    setCurrentPage(1); // reset pagination on filter change
  }, [searchTerm, selectedCategory, products]);

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-600 text-center">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('products.featured')}</h1>

      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <input
          type="text"
          placeholder={t('products.search_placeholder')}
          className="border rounded px-4 py-2 w-full md:w-1/2"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <select
          className="border rounded px-4 py-2"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option value="">{t('products.all_categories')}</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-600 text-center">{t('products.no_products')}</p>
      ) : (
        <>
          <ProductList products={paginated} />

          {/* Pagination Controls */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalPages }, (_, idx) => (
              <button
                key={idx}
                className={`px-3 py-1 border rounded ${
                  currentPage === idx + 1
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700'
                }`}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
