import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const Toast = ({ message, variant = 'info', onClose, duration = 3000 }) => {
  const { t } = useTranslation();
  const variantClasses = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    destructive: 'bg-red-100 text-red-800' // Added for compatibility
  };

  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md ${variantClasses[variant]} flex items-center justify-between min-w-[300px]`}>
      <span>{typeof message === 'string' ? t(message) : message}</span>
      <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
        &times;
      </button>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error', 'destructive']),
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number
};

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (options) => {
    const id = Math.random().toString(36).slice(2, 9);
    const newToast = {
      id,
      ...options,
      onClose: () => removeToast(id)
    };
    
    setToasts((prev) => [...prev, newToast]);
    
    if (options.duration === undefined) {
      setTimeout(() => removeToast(id), 3000);
    } else if (options.duration > 0) {
      setTimeout(() => removeToast(id), options.duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Create toast functions for different variants
  const toast = {
    show: (options) => addToast({ variant: 'info', ...options }),
    info: (message, options) => addToast({ message, variant: 'info', ...options }),
    success: (message, options) => addToast({ message, variant: 'success', ...options }),
    warning: (message, options) => addToast({ message, variant: 'warning', ...options }),
    error: (message, options) => addToast({ message, variant: 'error', ...options }),
    destructive: (message, options) => addToast({ message, variant: 'destructive', ...options })
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message || toast.description || toast.title}
            variant={toast.variant}
            onClose={toast.onClose}
            duration={toast.duration}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast; // Return just the toast object
};

// Named export for the toast object
export const toast = {
  show: (options) => console.warn('Toast not initialized. Wrap your app with ToastProvider'),
  info: (message, options) => console.warn('Toast not initialized. Wrap your app with ToastProvider'),
  success: (message, options) => console.warn('Toast not initialized. Wrap your app with ToastProvider'),
  warning: (message, options) => console.warn('Toast not initialized. Wrap your app with ToastProvider'),
  error: (message, options) => console.warn('Toast not initialized. Wrap your app with ToastProvider'),
  destructive: (message, options) => console.warn('Toast not initialized. Wrap your app with ToastProvider')
};

export default Toast;