// src/utils/handleApiError.js
import { useToast } from '../components/ui/Toast';

const handleApiError = (error, fallbackMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  // Get the toast function from the context
  const toast = useToast();
  
  // Extract error message from different possible locations
  const message = error?.response?.data?.message || 
                 error.message || 
                 fallbackMessage;
  
  // Show error toast
  toast.error(message);
  
  // Handle specific error cases
  if (error?.response?.status === 401) {
    // You can add redirect logic here if needed
    console.warn('Unauthorized access - redirecting to login');
  }
  
  // Return the error for further handling if needed
  return error;
};

export default handleApiError;