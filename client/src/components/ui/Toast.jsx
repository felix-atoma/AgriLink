import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  const { t } = useTranslation();
  const typeClasses = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md ${typeClasses[type]} flex items-center justify-between min-w-[300px]`}
    >
      <span>{typeof message === 'string' ? t(message) : message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-gray-500 hover:text-gray-700"
      >
        &times;
      </button>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number
};

export default Toast;