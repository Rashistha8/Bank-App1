import {
  STORAGE_KEYS,
  getData,
  setData,
  generateId,
  generateAccountNumber,
  initializeStorage,
} from '../utils/storage';

// Initialize storage on module load
initializeStorage();

// Simulate API delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate simple token
const generateToken = (userId) => {
  return btoa(`${userId}:${Date.now()}:${Math.random().toString(36)}`);
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    await delay();
    const users = getData(STORAGE_KEYS.USERS) || [];
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken(user.id);
    setData(STORAGE_KEYS.AUTH_TOKEN, token);
    setData(STORAGE_KEYS.CURRENT_USER, user.id);

    // Get account info
    const accounts = getData(STORAGE_KEYS.ACCOUNTS) || [];
    const account = accounts.find((a) => a.userId === user.id);

    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
      account,
    };
  },

  register: async (userData) => {
    await delay();
    const users = getData(STORAGE_KEYS.USERS) || [];

    // Check if email already exists
    if (users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: generateId(),
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      address: userData.address || '',
      phone: userData.phone || '',
      createdAt: new Date().toISOString(),
    };

    // Create account for new user
    const newAccount = {
      userId: newUser.id,
      balance: 0,
      accountNumber: generateAccountNumber(),
    };

    // Save user and account
    users.push(newUser);
    setData(STORAGE_KEYS.USERS, users);

    const accounts = getData(STORAGE_KEYS.ACCOUNTS) || [];
    accounts.push(newAccount);
    setData(STORAGE_KEYS.ACCOUNTS, accounts);

    const { password: _, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword };
  },

  logout: async () => {
    await delay(300);
    setData(STORAGE_KEYS.AUTH_TOKEN, null);
    setData(STORAGE_KEYS.CURRENT_USER, null);
    return { success: true };
  },

  getProfile: async () => {
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

    const accounts = getData(STORAGE_KEYS.ACCOUNTS) || [];
    const account = accounts.find((a) => a.userId === userId);

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, account };
  },

  updateProfile: async (updates) => {
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

    // Update allowed fields only
    const allowedFields = ['firstName', 'lastName', 'address', 'phone'];
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        users[userIndex][field] = updates[field];
      }
    });

    setData(STORAGE_KEYS.USERS, users);

    const { password: _, ...userWithoutPassword } = users[userIndex];
    return { user: userWithoutPassword };
  },

  changePassword: async (currentPassword, newPassword) => {
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

    if (users[userIndex].password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }

    users[userIndex].password = newPassword;
    setData(STORAGE_KEYS.USERS, users);

    return { success: true };
  },
};

// Account API
export const accountAPI = {
  getBalance: async () => {
    await delay();
    const userId = getData(STORAGE_KEYS.CURRENT_USER);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const accounts = getData(STORAGE_KEYS.ACCOUNTS) || [];
    const account = accounts.find((a) => a.userId === userId);

    if (!account) {
      throw new Error('Account not found');
    }

    return { balance: account.balance, accountNumber: account.accountNumber };
  },

  deposit: async (amount, description = '') => {
    await delay();
    const userId = getData(STORAGE_KEYS.CURRENT_USER);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const accounts = getData(STORAGE_KEYS.ACCOUNTS) || [];
    const accountIndex = accounts.findIndex((a) => a.userId === userId);

    if (accountIndex === -1) {
      throw new Error('Account not found');
    }

    // Update balance
    accounts[accountIndex].balance += amount;
    setData(STORAGE_KEYS.ACCOUNTS, accounts);

    // Create transaction record
    const transaction = {
      id: generateId(),
      userId,
      type: 'deposit',
      amount,
      description: description || 'Deposit',
      date: new Date().toISOString(),
      balanceAfter: accounts[accountIndex].balance,
    };

    const transactions = getData(STORAGE_KEYS.TRANSACTIONS) || [];
    transactions.push(transaction);
    setData(STORAGE_KEYS.TRANSACTIONS, transactions);

    return {
      success: true,
      transaction,
      newBalance: accounts[accountIndex].balance,
    };
  },

  withdraw: async (amount, description = '') => {
    await delay();
    const userId = getData(STORAGE_KEYS.CURRENT_USER);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const accounts = getData(STORAGE_KEYS.ACCOUNTS) || [];
    const accountIndex = accounts.findIndex((a) => a.userId === userId);

    if (accountIndex === -1) {
      throw new Error('Account not found');
    }

    if (accounts[accountIndex].balance < amount) {
      throw new Error('Insufficient funds');
    }

    // Update balance
    accounts[accountIndex].balance -= amount;
    setData(STORAGE_KEYS.ACCOUNTS, accounts);

    // Create transaction record
    const transaction = {
      id: generateId(),
      userId,
      type: 'withdraw',
      amount,
      description: description || 'Withdrawal',
      date: new Date().toISOString(),
      balanceAfter: accounts[accountIndex].balance,
    };

    const transactions = getData(STORAGE_KEYS.TRANSACTIONS) || [];
    transactions.push(transaction);
    setData(STORAGE_KEYS.TRANSACTIONS, transactions);

    return {
      success: true,
      transaction,
      newBalance: accounts[accountIndex].balance,
    };
  },
};

// Transactions API
export const transactionsAPI = {
  getAll: async (filters = {}) => {
    await delay();
    const userId = getData(STORAGE_KEYS.CURRENT_USER);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    let transactions = getData(STORAGE_KEYS.TRANSACTIONS) || [];

    // Filter by user
    transactions = transactions.filter((t) => t.userId === userId);

    // Filter by type
    if (filters.type && filters.type !== 'all') {
      transactions = transactions.filter((t) => t.type === filters.type);
    }

    // Filter by date range
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
      transactions = transactions.filter((t) => new Date(t.date) >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      transactions = transactions.filter((t) => new Date(t.date) <= end);
    }

    // Sort by date descending (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { transactions };
  },

  getRecent: async (limit = 5) => {
    await delay(300);
    const userId = getData(STORAGE_KEYS.CURRENT_USER);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    let transactions = getData(STORAGE_KEYS.TRANSACTIONS) || [];
    transactions = transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    return { transactions };
  },
};
