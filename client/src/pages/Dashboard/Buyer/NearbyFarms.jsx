import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MapSelector from '../../../components/shared/MapSelector';
import Spinner from '../../../components/shared/Spinner';
import apiClient from '../../../services/apiClient';

const NearbyFarms = () => {
  const { t } = useTranslation();

  const [location, setLocation] = useState(null);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLocationSelect = async ({ lat, lng }) => {
    setLocation({ lat, lng });
    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get('/products', {
        params: { lat, lng, distance: 30 } // e.g. 30km radius
      });
      setFarms(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">{t('nearby_farms.title')}</h2>

      <MapSelector onLocationSelect={handleLocationSelect} />

      {loading && <Spinner className="mt-6" />}

      {error && (
        <div className="mt-4 text-red-600 bg-red-100 p-3 rounded">
          {error}
        </div>
      )}

      {!loading && location && farms.length === 0 && (
        <p className="mt-4 text-gray-600">{t('nearby_farms.no_results')}</p>
      )}

      {!loading && farms.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {farms.map((farm) => (
            <div
              key={farm._id}
              className="border rounded-md p-4 shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-bold text-lg">{farm.name}</h3>
              <p className="text-sm text-gray-600">{farm.description}</p>
              <p className="mt-1 text-sm">
                <strong>{t('products.price')}:</strong> ${farm.price}
              </p>
              <p className="text-sm">
                <strong>{t('products.stock')}:</strong> {farm.quantity}
              </p>
              {farm.farmer && (
                <p className="text-sm text-gray-500">
                  {t('products.farmer')}: {farm.farmer.name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyFarms;
