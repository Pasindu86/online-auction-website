import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for auth token
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

// Response interceptor for error handling
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

// AUTH API FUNCTIONS - MATCHES YOUR BACKEND EXACTLY

// Register user - sends User object to /api/auth/register
export const registerUser = async (userData) => {
  try {
    console.log('Attempting registration with data:', userData);
    console.log('API URL:', API_BASE_URL);
    
    const response = await api.post('/auth/register', userData);
    console.log('Registration successful:', response.data);
    return response.data; // Returns AuthResponse
  } catch (error) {
    console.error('Registration API error:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// Login user - sends LoginRequest to /api/auth/login
export const loginUser = async (credentials) => {
  try {
    const loginRequest = {
      email: credentials.email,
      passwordHash: credentials.password // Your backend expects PasswordHash
    };
    
    const response = await api.post('/auth/login', loginRequest);
    
    // Store user data if successful
    if (response.data && response.data.id) {
      localStorage.setItem('userId', response.data.id.toString());
      localStorage.setItem('userEmail', response.data.email);
      localStorage.setItem('userName', response.data.username);
      localStorage.setItem('userRole', response.data.role);
    }
    
    return response.data; // Returns AuthResponse
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
  }
};

// Get current user from localStorage
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
