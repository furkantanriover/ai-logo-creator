import React, { createContext, useContext, ReactNode, useMemo } from 'react';

import { useAuth, AuthState } from '../hooks/useAuth';

// Create auth context with default values
const AuthContext = createContext<AuthState>({
  initializing: true,
  user: null,
  signInAnonymously: async () => {},
  signOut: async () => {},
  error: null,
});

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authState = useAuth();

  // Memoize value to prevent unnecessary re-renders
  const value = useMemo(() => authState, [authState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for consumers to access auth context
export const useAuthContext = () => useContext(AuthContext);
