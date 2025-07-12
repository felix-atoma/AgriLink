import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = ({ year }) => {
  const { t } = useTranslation('common'); // <-- specify namespace

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
        <p>
          {t('appName')} © {year || new Date().getFullYear()} – {t('allRightsReserved')}
        </p>

        <div className="mt-3 flex justify-center space-x-6">
          <a href="/terms" className="hover:text-primary-600">
            {t('terms')}
          </a>
          <a href="/privacy" className="hover:text-primary-600">
            {t('privacy')}
          </a>
          <a href="/contact" className="hover:text-primary-600">
            {t('contact')}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
