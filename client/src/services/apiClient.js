import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
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
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// ✅ Updated Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const response = error.response;

    // Safely log the error without modifying the original error object
    const normalizedError = {
      status: response?.status,
      message: response?.data?.message || error.message,
      errors: response?.data?.errors || [],
      url: error.config?.url,
      payload: error.config?.data,
      original: error
    };

    console.error('[API Error]', normalizedError);

    if (response?.status === 401) {
      localStorage.removeItem('token');
    }

    return Promise.reject(error); // re-throw original error
  }
);

// Optional: helper method for sending FormData
apiClient.postFormData = async (url, data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });
  return apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export default apiClient;
