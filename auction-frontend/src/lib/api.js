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
      // Store individual fields for easy access
      localStorage.setItem('userId', response.data.id.toString());
      localStorage.setItem('userEmail', response.data.email);
      localStorage.setItem('userName', response.data.username);
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('authToken', 'logged-in-' + Date.now());
      
      // Also store complete user object for application use
      const userObject = {
        id: response.data.id,
        email: response.data.email,
        firstName: response.data.username || response.data.email.split('@')[0],
        username: response.data.username,
        role: response.data.role
      };
      localStorage.setItem('user', JSON.stringify(userObject));
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
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

// AUCTION API FUNCTIONS

// Create auction
export const createAuction = async (auctionData) => {
  try {
    const response = await api.post('/auctions', auctionData);
    return response.data;
  } catch (error) {
    console.error('Create auction error:', error);
    throw error;
  }
};

// Get all auctions
export const getAllAuctions = async () => {
  try {
    const response = await api.get('/auctions');
    return response.data;
  } catch (error) {
    console.error('Get auctions error:', error);
    throw error;
  }
};

// Get auction by ID
export const getAuctionById = async (id) => {
  try {
    const response = await api.get(`/auctions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get auction error:', error);
    throw error;
  }
};

// Update auction
export const updateAuction = async (id, auctionData) => {
  try {
    const response = await api.put(`/auctions/${id}`, auctionData);
    return response.data;
  } catch (error) {
    console.error('Update auction error:', error);
    throw error;
  }
};

// Delete auction
export const deleteAuction = async (id) => {
  try {
    const response = await api.delete(`/auctions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete auction error:', error);
    throw error;
  }
};

// Upload image for auction
export const uploadAuctionImage = async (file, auctionId) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('auctionId', auctionId.toString());

    const response = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload image error:', error);
    throw error;
  }
};

export default api;
