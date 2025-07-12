import React from 'react'
import { useTranslation } from 'react-i18next';

const Spinner = () => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  );
};

export default Spinner;