import axios from 'axios';

// Create a separate axios instance for DummyJSON API
const dummyApiInstance = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
dummyApiInstance.interceptors.request.use(
  (config) => {
    console.log(`[DummyAPI] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
dummyApiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[DummyAPI] Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// User Management API
export const dummyUserAPI = {
  // Get all users with pagination
  getUsers: async (limit = 10, skip = 0) => {
    const response = await dummyApiInstance.get('/users', {
      params: { limit, skip },
    });
    return response.data;
  },

  // Get a single user by ID
  getUserById: async (userId) => {
    const response = await dummyApiInstance.get(`/users/${userId}`);
    return response.data;
  },

  // Search users by query
  searchUsers: async (query) => {
    const response = await dummyApiInstance.get('/users/search', {
      params: { q: query },
    });
    return response.data;
  },

  // Update user details (PUT - full update)
  updateUser: async (userId, userData) => {
    const response = await dummyApiInstance.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Partial update user details (PATCH)
  patchUser: async (userId, userData) => {
    const response = await dummyApiInstance.patch(`/users/${userId}`, userData);
    return response.data;
  },

  // Delete a user
  deleteUser: async (userId) => {
    const response = await dummyApiInstance.delete(`/users/${userId}`);
    return response.data;
  },

  // Add a new user
  addUser: async (userData) => {
    const response = await dummyApiInstance.post('/users/add', userData);
    return response.data;
  },
};

export default dummyApiInstance;
