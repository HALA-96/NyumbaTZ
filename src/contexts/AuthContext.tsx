/**
 * AUTHENTICATION CONTEXT
 * 
 * React context for managing user authentication state across the application.
 * Provides authentication functions and user data to all components.
 * 
 * KEY FEATURES:
 * - User authentication state management
 * - Login/logout functionality
 * - User profile data
 * - Loading states
 * - Error handling
 * - Automatic session restoration
 * 
 * USAGE:
 * - Wrap app with AuthProvider
 * - Use useAuth hook in components
 * - Access user data and auth functions
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, auth, db, storage, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import type { Database } from '../lib/supabase';

// Types
type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  // User state
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  
  // Loading states
  loading: boolean;
  profileLoading: boolean;
  
  // Authentication functions
  signUp: (email: string, password: string, userData: {
    fullName: string;
    phoneNumber: string;
    userRole: 'tenant' | 'landlord';
  }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  
  // Profile functions
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  uploadAvatar: (file: File) => Promise<{ error: any; url?: string }>;
  
  // Utility functions
  isLandlord: boolean;
  isTenant: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AUTH PROVIDER COMPONENT
 * 
 * Provides authentication context to the entire application.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  /**
   * LOAD USER PROFILE
   * 
   * Fetches user profile data from the database.
   */
  const loadProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      console.log('Loading profile for user:', userId);
      
      // Check if Supabase is properly configured
      if (!isSupabaseConfigured) {
        console.log('Supabase not configured, skipping profile load');
        setProfile(null);
        return;
      }
      
      try {
        const { data, error } = await db.profiles.getById(userId);
        
        if (error) {
          console.error('Error loading profile:', error);
          // Create a basic profile if none exists
          console.log('Creating basic profile for user:', userId);
          const basicProfile = {
            id: userId,
            full_name: 'User',
            phone_number: '',
            user_role: 'tenant' as const,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setProfile(basicProfile);
          return;
        }
        
        console.log('Profile loaded:', data);
        setProfile(data);
      } catch (dbError) {
        console.error('Database error loading profile:', dbError);
        // Create a basic profile on database error
        const basicProfile = {
          id: userId,
          full_name: 'User',
          phone_number: '',
          user_role: 'tenant' as const,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(basicProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  /**
   * SIGN UP FUNCTION
   * 
   * Creates a new user account with profile data.
   */
  const signUp = async (
    email: string, 
    password: string, 
    userData: { fullName: string; phoneNumber: string; userRole: 'tenant' | 'landlord' }
  ) => {
    try {
      console.log('Starting signup process...', { email, userData });
      
      // Check if Supabase is configured
      if (!supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseAnonKey || supabaseAnonKey.includes('placeholder')) {
        console.log('Supabase not configured, simulating signup success');
        // Create a mock user for development
        const mockUser = {
          id: Date.now().toString(),
          email,
          user_metadata: userData
        };
        setUser(mockUser as any);
        setProfile({
          id: mockUser.id,
          full_name: userData.fullName,
          phone_number: userData.phoneNumber,
          user_role: userData.userRole,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any);
        return { error: null };
      }
      
      const { data, error } = await auth.signUp(email, password, userData);
      
      if (error) {
        console.error('Signup error:', error);
        return { error };
      }
      
      console.log('Signup data:', data);
      
      // If user is created but needs email confirmation
      if (data.user && !data.session) {
        console.log('User created, email confirmation required');
        return { error: null };
      }
      
      // If user is immediately signed in
      if (data.user && data.session) {
        console.log('User created and signed in immediately');
        setUser(data.user);
        setSession(data.session);
        await loadProfile(data.user.id);
      }
      
      return { error: null };
    } catch (error) {
      console.error('Signup catch error:', error);
      return { error };
    }
  };

  /**
   * SIGN IN FUNCTION
   * 
   * Authenticates user with email and password.
   */
  const signIn = async (email: string, password: string) => {
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured) {
        console.log('Supabase not configured, simulating signin success');
        return { error: null };
      }
      
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  /**
   * SIGN OUT FUNCTION
   * 
   * Signs out the current user and clears state.
   */
  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  /**
   * RESET PASSWORD FUNCTION
   * 
   * Sends password reset email to user.
   */
  const resetPassword = async (email: string) => {
    try {
      if (!isSupabaseConfigured) {
        return { error: { message: 'Supabase not configured' } };
      }
      
      const { data, error } = await auth.resetPassword(email);
      return { error };
    } catch (error) {
      return { error };
    }
  };

  /**
   * UPDATE PROFILE FUNCTION
   * 
   * Updates user profile data in the database.
   */
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: 'No user logged in' };
    }

    try {
      const { data, error } = await db.profiles.update(user.id, updates);
      
      if (error) {
        return { error };
      }
      
      setProfile(data);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  /**
   * UPLOAD AVATAR FUNCTION
   * 
   * Uploads user avatar image to Supabase Storage.
   */
  const uploadAvatar = async (file: File) => {
    if (!user) {
      return { error: 'No user logged in' };
    }

    try {
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await storage.uploadAvatar(user.id, file);
      
      if (uploadError) {
        return { error: uploadError };
      }
      
      // Update profile with new avatar URL
      const { error: updateError } = await updateProfile({
        avatar_url: uploadData!.publicUrl
      });
      
      if (updateError) {
        return { error: updateError };
      }
      
      return { error: null, url: uploadData!.publicUrl };
    } catch (error) {
      return { error };
    }
  };

  /**
   * AUTHENTICATION STATE LISTENER
   * 
   * Listens for authentication state changes and updates context.
   */
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        
        // If Supabase is not configured, skip auth and set loading to false
        if (!isSupabaseConfigured) {
          console.log('Supabase not configured, skipping auth initialization');
          setLoading(false);
          return;
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session);
        
        if (session) {
          setSession(session);
          setUser(session.user);
          try {
            await loadProfile(session.user.id);
          } catch (profileError) {
            console.error('Error loading profile:', profileError);
            // Continue anyway, don't block the app
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    getInitialSession();

    // If Supabase is not configured, don't set up auth listener
    if (!isSupabaseConfigured) {
      return;
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            await loadProfile(session.user.id);
          } catch (profileError) {
            console.error('Error loading profile:', profileError);
            // Continue anyway, don't block the app
          }
        } else {
          setProfile(null);
        }
        
        if (loading) {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loading]);

  // Computed values
  const isLandlord = profile?.user_role === 'landlord';
  const isTenant = profile?.user_role === 'tenant';

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    profileLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    uploadAvatar,
    isLandlord,
    isTenant
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * USE AUTH HOOK
 * 
 * Custom hook to access authentication context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;