// src/utils/apiWrapper.js
import handleApiError from './handleApiError';
import apiClient from '../services/apiClient';

export const postData = async (url, data, options = {}, fallbackMessage) => {
  try {
    const response = await apiClient.post(url, data, options);
    return response.data;
  } catch (error) {
    handleApiError(error, fallbackMessage);
    throw error; // re-throw if you need to handle it further
  }
};
