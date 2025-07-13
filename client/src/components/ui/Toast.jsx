import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const Toast = ({ message, status = 'info', onClose, duration = 3000 }) => {
  const { t } = useTranslation();
  const statusClasses = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md ${statusClasses[status]} flex items-center justify-between min-w-[300px]`}>
      <span>{typeof message === 'string' ? t(message) : message}</span>
      <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
        &times;
      </button>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  status: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number
};

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = (options) => {
    const id = Math.random().toString(36).slice(2, 9);
    const newToast = {
      id,
      ...options,
      onClose: () => removeToast(id)
    };
    
    setToasts((prev) => [...prev, newToast]);
    
    if (options.duration === undefined) {
      setTimeout(() => removeToast(id), 3000); // Default duration
    } else if (options.duration > 0) {
      setTimeout(() => removeToast(id), options.duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.description || toast.title}
            status={toast.status}
            onClose={toast.onClose}
            duration={toast.duration}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default Toast;