import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../api/axios';

const AuthContext = createContext();

const extractAuthPayload = (response) => {
  // Support both { data: { token, user } } and { token, user } API shapes.
  return response?.data?.data || response?.data || {};
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('authToken');
      const savedUser = await AsyncStorage.getItem('authUser');

      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        // Refresh user data from server in background to get full profile
        try {
          const response = await axiosInstance.get('/auth/me');
          const userData = response.data;
          // Only update if data changed or fields were missing
          await AsyncStorage.setItem('authUser', JSON.stringify(userData));
          setUser(userData);
        } catch (meErr) {
          console.error('Background refresh failed:', meErr);
        }
      }
    } catch (error) {
      console.error('Error restoring token:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });

      const { token: authToken, user: userData } = extractAuthPayload(response);

      if (!authToken || !userData) {
        return { success: false, error: 'Invalid login response from server' };
      }

      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('authUser', JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role, additionalData = {}) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/auth/register', {
        name,
        email,
        password,
        role,
        ...additionalData,
      });

      const { token: authToken, user: userData } = extractAuthPayload(response);

      if (!authToken || !userData) {
        return { success: false, error: 'Invalid registration response from server' };
      }

      return { success: true };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        'Registration failed. Please try again.';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'authUser']);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const newUser = { ...user, ...updatedData };
      await AsyncStorage.setItem('authUser', JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error('Error updating local user data:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
