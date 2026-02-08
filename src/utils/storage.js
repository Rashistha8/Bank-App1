// LocalStorage keys
export const STORAGE_KEYS = {
  USERS: 'bank_users',
  TRANSACTIONS: 'bank_transactions',
  ACCOUNTS: 'bank_accounts',
  AUTH_TOKEN: 'bank_auth_token',
  CURRENT_USER: 'bank_current_user',
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Generate account number
export const generateAccountNumber = () => {
  return 'ACC' + Math.random().toString().substring(2, 12);
};

// Get data from localStorage (sync version)
export const getData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
};

// Set data to localStorage
export const setData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    return false;
  }
};

// Remove data from localStorage
export const removeData = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
    return false;
  }
};

// Initialize storage with seed data if empty
export const initializeStorage = () => {
  // Initialize users if not exists
  if (!getData(STORAGE_KEYS.USERS)) {
    const defaultUsers = [
      {
        id: 'user_1',
        email: 'admin@test.com',
        password: 'password',
        firstName: 'Admin',
        lastName: 'User',
        address: '123 Admin Street',
        phone: '1234567890',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user_2',
        email: 'user@test.com',
        password: 'password',
        firstName: 'Regular',
        lastName: 'User',
        address: '456 User Avenue',
        phone: '0987654321',
        createdAt: new Date().toISOString(),
      },
    ];
    setData(STORAGE_KEYS.USERS, defaultUsers);
  }

  // Initialize accounts if not exists
  if (!getData(STORAGE_KEYS.ACCOUNTS)) {
    const defaultAccounts = [
      {
        userId: 'user_1',
        balance: 10000,
        accountNumber: 'ACC1234567890',
      },
      {
        userId: 'user_2',
        balance: 5000,
        accountNumber: 'ACC0987654321',
      },
    ];
    setData(STORAGE_KEYS.ACCOUNTS, defaultAccounts);
  }

  // Initialize transactions if not exists
  if (!getData(STORAGE_KEYS.TRANSACTIONS)) {
    const now = new Date();
    const defaultTransactions = [
      {
        id: 'txn_1',
        userId: 'user_1',
        type: 'deposit',
        amount: 5000,
        description: 'Initial deposit',
        date: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
        balanceAfter: 5000,
      },
      {
        id: 'txn_2',
        userId: 'user_1',
        type: 'deposit',
        amount: 3000,
        description: 'Salary credit',
        date: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
        balanceAfter: 8000,
      },
      {
        id: 'txn_3',
        userId: 'user_1',
        type: 'withdraw',
        amount: 500,
        description: 'ATM withdrawal',
        date: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
        balanceAfter: 7500,
      },
      {
        id: 'txn_4',
        userId: 'user_1',
        type: 'deposit',
        amount: 2500,
        description: 'Freelance payment',
        date: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
        balanceAfter: 10000,
      },
      {
        id: 'txn_5',
        userId: 'user_2',
        type: 'deposit',
        amount: 5000,
        description: 'Initial deposit',
        date: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
        balanceAfter: 5000,
      },
    ];
    setData(STORAGE_KEYS.TRANSACTIONS, defaultTransactions);
  }
};

// Clear all bank data (for testing/reset)
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeData(key);
  });
};
