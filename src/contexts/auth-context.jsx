'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1/auth';

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      const { user, token } = data;

      // Store user and token in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      // Update state
      setUser(user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error; // Re-throw the error to handle it in the component
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (name, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const { user, token } = data;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      setUser(user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

