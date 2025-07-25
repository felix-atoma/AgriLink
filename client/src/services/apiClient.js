import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://agrilink-1-zqcq.onrender.com/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message;
    const errorStatus = error.response?.status;
    const errorData = {
      status: errorStatus,
      message: errorMessage,
      errors: error.response?.data?.errors || [],
      url: error.config?.url,
      payload: error.config?.data,
      stack: error.stack,
    };

    console.error('[API Error]', errorData);

    // Handle specific status codes
    if (errorStatus === 401) {
      // Clear token and redirect if unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login?session=expired';
    }

    return Promise.reject(error);
  }
);

export default apiClient;