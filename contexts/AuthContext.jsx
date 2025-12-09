// contexts/AuthContext.jsx
"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authAPI.getCurrentUser();
      setUser(response.user);
    } catch (err) {
      console.error('Auth check failed:', err);
      // Token might be expired, clear it
      authAPI.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login(email, password);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (email, username, name, password) => {
    try {
      setError(null);
      const response = await authAPI.register(email, username, name, password);

      // Auto-login after registration
      if (response.user) {
        await login(email, password);
      }

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
