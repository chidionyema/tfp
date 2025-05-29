// File: src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '@/hooks/useAuth'; // Renamed import to avoid conflict if useAuth is also a common var name

// Define the User type - this should match the User type in your useAuth hook
// or be imported from a shared types definition.
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isLoggedIn: boolean; // Assuming 'isLoggedIn' is part of your user object structure
  // Add any other properties your user object might have
}

interface AuthContextType {
  user: User | null; // Changed from any: user can be User object or null
  loading: boolean;
  isAuthenticated: boolean;
  login: (userData: User) => void; // Changed from any: login expects a User object
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // useAuthHook() is the actual call to your custom hook
  const auth = useAuthHook(); 

  // Ensure the value provided to context matches AuthContextType
  const contextValue: AuthContextType = {
    user: auth.user as User | null, // Cast if useAuthHook().user type is slightly different but compatible
    loading: auth.loading,
    isAuthenticated: auth.isAuthenticated,
    login: auth.login as (userData: User) => void, // Cast if needed
    logout: auth.logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};