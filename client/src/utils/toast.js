// src/utils/toast.js
import { toast as toastify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Individual toast functions
export const showSuccess = (message) => toastify.success(message);
export const showError = (message) => toastify.error(message);
export const showInfo = (message) => toastify.info(message);
export const showWarning = (message) => toastify.warning(message);

// Named export for direct usage
export const toast = {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning
};

// Hook version for components
export const useToast = () => toast;

// Default export
export default toast;