// File: src/hooks/useAuth.ts
"use client";

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isLoggedIn: boolean;
}

export const useAuth = () => { // Opening brace for useAuth function
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { // Opening brace for useEffect callback
    // Check for demo user in localStorage
    const userData = localStorage.getItem('taskforperks-demo-user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setLoading(false);
  }, []); // Closing brace for useEffect callback

  const login = (userData: User) => { // Opening brace for login function
    setUser(userData);
    localStorage.setItem('taskforperks-demo-user', JSON.stringify(userData));
  }; // Closing brace for login function

  const logout = () => { // Opening brace for logout function
    setUser(null);
    localStorage.removeItem('taskforperks-demo-user');
  }; // Closing brace for logout function

  return { // Opening brace for returned object
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout
  }; // Closing brace for returned object
}; // <--- Added missing closing brace for useAuth function