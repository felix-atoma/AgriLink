import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const MapSelector = ({ onLocationSelect }) => {
  const { t } = useTranslation();
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          onLocationSelect({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [onLocationSelect]);

  return (
    <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
      {location ? (
        <p>
          {t('map.location')}: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </p>
      ) : (
        <p>{t('map.loading')}</p>
      )}
    </div>
  );
};

export default MapSelector;