import axios from 'axios';
import { STORAGE_KEYS, getData, setData } from './storage';

// Simulate API delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Create axios instance
const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getData(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Mock API handlers
const mockHandlers = {
  // GET /api/user - Get current user details
  'GET /api/user': async () => {
    await delay();
    const userId = getData(STORAGE_KEYS.CURRENT_USER);
    if (!userId) {
      return { status: 401, data: { message: 'Not authenticated' } };
    }

    const users = getData(STORAGE_KEYS.USERS) || [];
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return { status: 404, data: { message: 'User not found' } };
    }

    const { password: _, ...userWithoutPassword } = user;
    return { status: 200, data: { user: userWithoutPassword } };
  },

  // PUT /api/user - Update user details
  'PUT /api/user': async (config) => {
    await delay();
    const userId = getData(STORAGE_KEYS.CURRENT_USER);
    if (!userId) {
      return { status: 401, data: { message: 'Not authenticated' } };
    }

    const users = getData(STORAGE_KEYS.USERS) || [];
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return { status: 404, data: { message: 'User not found' } };
    }

    const updates = JSON.parse(config.data);
    const allowedFields = ['firstName', 'lastName', 'address', 'phone', 'email'];

    // Check if email is being changed and already exists
    if (updates.email && updates.email !== users[userIndex].email) {
      const emailExists = users.some(
        (u) => u.email.toLowerCase() === updates.email.toLowerCase() && u.id !== userId
      );
      if (emailExists) {
        return { status: 400, data: { message: 'Email already in use' } };
      }
    }

    // Update allowed fields
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        users[userIndex][field] = updates[field];
      }
    });

    users[userIndex].updatedAt = new Date().toISOString();
    setData(STORAGE_KEYS.USERS, users);

    const { password: _, ...userWithoutPassword } = users[userIndex];
    return {
      status: 200,
      data: { user: userWithoutPassword, message: 'User updated successfully' },
    };
  },

  // PATCH /api/user - Partial update user details
  'PATCH /api/user': async (config) => {
    return mockHandlers['PUT /api/user'](config);
  },

  // GET /api/users - Get all users (admin only - for demo)
  'GET /api/users': async () => {
    await delay();
    const users = getData(STORAGE_KEYS.USERS) || [];
    const usersWithoutPasswords = users.map(({ password: _, ...user }) => user);
    return { status: 200, data: { users: usersWithoutPasswords } };
  },
};

// Response interceptor - mock API responses
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Check if this is a network error (no response) - means we should mock it
    if (!error.response && config) {
      const method = config.method.toUpperCase();
      const url = config.url;
      const handlerKey = `${method} ${url}`;

      const handler = mockHandlers[handlerKey];
      if (handler) {
        try {
          const mockResponse = await handler(config);
          if (mockResponse.status >= 200 && mockResponse.status < 300) {
            return {
              data: mockResponse.data,
              status: mockResponse.status,
              statusText: 'OK',
              headers: {},
              config,
            };
          } else {
            return Promise.reject({
              response: {
                data: mockResponse.data,
                status: mockResponse.status,
                statusText: 'Error',
                headers: {},
                config,
              },
            });
          }
        } catch (mockError) {
          return Promise.reject(mockError);
        }
      }
    }

    // Handle 401 errors
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Helper methods that use the mock API
export const userAPI = {
  // Get current user details
  getUser: async () => {
    await delay();
    const userId = getData(STORAGE_KEYS.CURRENT_USER);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const users = getData(STORAGE_KEYS.USERS) || [];
    const user = users.find((u) => u.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  },

  // Update user details using axios instance
  updateUser: async (updates) => {
    await delay();
    const userId = getData(STORAGE_KEYS.CURRENT_USER);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const users = getData(STORAGE_KEYS.USERS) || [];
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Check if email is being changed and already exists
    if (updates.email && updates.email !== users[userIndex].email) {
      const emailExists = users.some(
        (u) => u.email.toLowerCase() === updates.email.toLowerCase() && u.id !== userId
      );
      if (emailExists) {
        throw new Error('Email already in use');
      }
    }

    const allowedFields = ['firstName', 'lastName', 'address', 'phone', 'email'];
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        users[userIndex][field] = updates[field];
      }
    });

    users[userIndex].updatedAt = new Date().toISOString();
    setData(STORAGE_KEYS.USERS, users);

    const { password: _, ...userWithoutPassword } = users[userIndex];
    return { user: userWithoutPassword, message: 'User updated successfully' };
  },

  // Get all users
  getAllUsers: async () => {
    await delay();
    const users = getData(STORAGE_KEYS.USERS) || [];
    const usersWithoutPasswords = users.map(({ password: _, ...user }) => user);
    return { users: usersWithoutPasswords };
  },
};

export default axiosInstance;
