import { showError } from './toast';

const handleApiError = (error, fallbackMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  const message = error?.response?.data?.message || 
                 error.message || 
                 fallbackMessage;
  
  showError(message);
  
  if (error?.response?.status === 401) {
    console.warn('Unauthorized access - redirecting to login');
  }
  
  return error;
};

export default handleApiError;