import React from 'react';
import { useTranslation } from 'react-i18next';

const RoleSelector = ({ register }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
        {t('auth.role')}
      </label>

      <div className="flex items-center space-x-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            value="buyer"
            {...register('role', { required: true })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
          />
          <span className="ml-2 text-gray-800">{t('auth.role_buyer')}</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            value="farmer"
            {...register('role', { required: true })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
          />
          <span className="ml-2 text-gray-800">{t('auth.role_farmer')}</span>
        </label>
      </div>
    </div>
  );
};

export default RoleSelector;
