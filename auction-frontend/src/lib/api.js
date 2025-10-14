import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api';

const api = axios.create({  
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// AUTH API FUNCTIONS

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', {
      username: userData.username,
      email: userData.email,
      passwordHash: userData.passwordHash || userData.password
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verify email
export const verifyEmail = async (token) => {
  try {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Resend verification email
export const resendVerificationEmail = async (email) => {
  try {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const loginRequest = {
      email: credentials.email,
      passwordHash: credentials.password
    };
    
    const response = await api.post('/auth/login', loginRequest);
    
    // Store user data
    if (response.data && response.data.id) {
      const normalizedUser = {
        id: response.data.id,
        email: response.data.email,
        username: response.data.username,   
        role: response.data.role,
      };

      localStorage.setItem('userId', normalizedUser.id.toString());
      localStorage.setItem('userEmail', normalizedUser.email);
      localStorage.setItem('userName', normalizedUser.username);
      localStorage.setItem('userRole', normalizedUser.role ?? 'user');
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
  }
};

// Get current user
export const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    
    if (userId && userEmail && userName) {
      return {
        id: parseInt(userId),
        email: userEmail,
        username: userName,
        role: userRole
      };
    }
  }
  return null;
};

export default api;
