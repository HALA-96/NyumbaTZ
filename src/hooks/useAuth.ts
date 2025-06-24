/**
 * AUTHENTICATION HOOK - SIMPLIFIED AUTH MANAGEMENT
 * 
 * Custom hook that wraps the AuthContext for easier usage.
 * Provides authentication state and methods.
 */

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Re-export for convenience
export default useAuth;