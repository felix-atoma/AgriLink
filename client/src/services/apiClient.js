import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request Error:', error);
  return Promise.reject(error);
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Normalize successful responses
    return {
      ...response,
      data: response.data,
      status: response.status,
      statusText: response.statusText
    };
  },
  (error) => {
    // Normalize error responses
    const normalizedError = {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data,
      isAxiosError: error.isAxiosError
    };
    
    console.error('API Error:', normalizedError);
    
    // Specific handling for common status codes
    if (error.response?.status === 401) {
      // Handle unauthorized (token expired, etc.)
      localStorage.removeItem('token');
    }
    
    return Promise.reject(normalizedError);
  }
);

// Helper methods for common requests
apiClient.postFormData = async (url, data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  return apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export default apiClient;