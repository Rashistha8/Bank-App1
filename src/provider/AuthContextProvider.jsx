import { authAPI, accountAPI } from '../services/api';
import { STORAGE_KEYS, getData, initializeStorage } from '../utils/storage';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = getData(STORAGE_KEYS.AUTH_TOKEN);
      const userId = getData(STORAGE_KEYS.CURRENT_USER);

      if (token && userId) {
        const { user: userData, account: accountData } = await authAPI.getProfile();
        setUser(userData);
        setAccount(accountData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { user: userData, account: accountData } = await authAPI.login(email, password);
    setUser(userData);
    setAccount(accountData);
    return userData;
  };

  const register = async (userData) => {
    const result = await authAPI.register(userData);
    return result;
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    setAccount(null);
  };

  const updateProfile = async (updates) => {
    const { user: updatedUser } = await authAPI.updateProfile(updates);
    setUser(updatedUser);
    return updatedUser;
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await authAPI.changePassword(currentPassword, newPassword);
  };

  const refreshBalance = async () => {
    try {
      const { balance, accountNumber } = await accountAPI.getBalance();
      setAccount((prev) => ({ ...prev, balance, accountNumber }));
      return balance;
    } catch (error) {
      console.error('Failed to refresh balance:', error);
      throw error;
    }
  };

  // 🔹 New functions for deposit and withdraw
  const deposit = async (amount, description) => {
    const result = await accountAPI.deposit(amount, description);
    setAccount((prev) => ({
      ...prev,
      balance: result.newBalance,
      depositsCount: (prev?.depositsCount || 0) + 1,
      transactionsCount: (prev?.transactionsCount || 0) + 1,
    }));
    return result;
  };

  const withdraw = async (amount, description) => {
    const result = await accountAPI.withdraw(amount, description);
    setAccount((prev) => ({
      ...prev,
      balance: result.newBalance,
      withdrawalsCount: (prev?.withdrawalsCount || 0) + 1,
      transactionsCount: (prev?.transactionsCount || 0) + 1,
    }));
    return result;
  };

  const value = {
    user,
    account,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshBalance,
    deposit,   // added
    withdraw,  // added
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
