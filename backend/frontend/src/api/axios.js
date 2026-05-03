import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEFAULT_API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api/v1'
    : 'http://localhost:5000/api/v1';

const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Keep this interceptor side-effect minimal to avoid web refresh loops.
        await AsyncStorage.multiRemove(['authToken', 'authUser']);
      } catch (err) {
        console.error('Error clearing storage:', err);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
