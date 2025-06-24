/**
 * SUPABASE CLIENT CONFIGURATION
 * 
 * This file sets up the Supabase client for authentication and database operations.
 * Supabase provides a complete backend solution with authentication, database, and real-time features.
 * 
 * KEY FEATURES:
 * - User authentication (email/password)
 * - PostgreSQL database with real-time subscriptions
 * - Row Level Security (RLS) for data protection
 * - File storage for property images
 * - Automatic API generation
 * 
 * ENVIRONMENT VARIABLES:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Get your project URL and anon key from Settings > API
 * 3. Add them to your .env file
 * 4. Run the database migrations to create tables
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('your-project') && 
  !supabaseAnonKey.includes('your-anon-key');

console.log('Supabase configuration:', {
  url: supabaseUrl ? 'configured' : 'missing',
  key: supabaseAnonKey ? 'configured' : 'missing',
  isConfigured: isSupabaseConfigured
});

// Export configuration status for use in other modules
export { isSupabaseConfigured, supabaseUrl, supabaseAnonKey };

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key', 
  {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

/**
 * DATABASE TYPES
 * 
 * TypeScript interfaces that match our Supabase database schema.
 * These ensure type safety when working with database operations.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone_number: string;
          user_role: 'tenant' | 'landlord';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone_number: string;
          user_role: 'tenant' | 'landlord';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone_number?: string;
          user_role?: 'tenant' | 'landlord';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string;
          property_type: 'house' | 'apartment' | 'studio' | 'villa' | 'room';
          bedrooms: number;
          bathrooms: number;
          monthly_rent: number;
          city: string;
          area: string;
          contact_phone: string;
          images: string[];
          amenities: string[];
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description: string;
          property_type: 'house' | 'apartment' | 'studio' | 'villa' | 'room';
          bedrooms: number;
          bathrooms: number;
          monthly_rent: number;
          city: string;
          area: string;
          contact_phone: string;
          images?: string[];
          amenities?: string[];
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string;
          property_type?: 'house' | 'apartment' | 'studio' | 'villa' | 'room';
          bedrooms?: number;
          bathrooms?: number;
          monthly_rent?: number;
          city?: string;
          area?: string;
          contact_phone?: string;
          images?: string[];
          amenities?: string[];
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      inquiries: {
        Row: {
          id: string;
          property_id: string;
          tenant_id: string;
          landlord_id: string;
          tenant_name: string;
          tenant_phone: string;
          message: string;
          status: 'new' | 'contacted' | 'viewed' | 'closed';
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          tenant_id: string;
          landlord_id: string;
          tenant_name: string;
          tenant_phone: string;
          message: string;
          status?: 'new' | 'contacted' | 'viewed' | 'closed';
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          tenant_id?: string;
          landlord_id?: string;
          tenant_name?: string;
          tenant_phone?: string;
          message?: string;
          status?: 'new' | 'contacted' | 'viewed' | 'closed';
          created_at?: string;
        };
      };
    };
  };
}

/**
 * AUTHENTICATION HELPERS
 * 
 * Helper functions for common authentication operations.
 */

export const auth = {
  // Sign up new user
  signUp: async (email: string, password: string, userData: { fullName: string; phoneNumber: string; userRole: 'tenant' | 'landlord' }) => {
    try {
      console.log('Starting signup with data:', { email, userData });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: userData.fullName,
            phone_number: userData.phoneNumber,
            user_role: userData.userRole
          }
        }
      });
      
      if (error) {
        console.error('Supabase signup error:', error.message, error);
        return { data, error };
      }
      
      console.log('Signup successful, user created:', data.user?.id);
      
      return { data, error: null };
    } catch (err) {
      console.error('Signup catch error:', err);
      return { data: null, error: err };
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Update password
  updatePassword: async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Sign in user
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign out user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  // Get current session
  getSession: () => {
    return supabase.auth.getSession();
  }
};

/**
 * DATABASE HELPERS
 * 
 * Helper functions for common database operations.
 */

export const db = {
  // Properties
  properties: {
    // Get all properties with filters
    getAll: async (filters?: {
      city?: string;
      priceMin?: number;
      priceMax?: number;
      propertyType?: string;
      bedrooms?: number;
      bathrooms?: number;
      limit?: number;
      offset?: number;
      search?: string;
    }) => {
      let query = supabase
        .from('properties')
        .select(`
          *,
          profiles!properties_owner_id_fkey (
            full_name,
            phone_number,
            user_role
          )
        `)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters?.priceMin) {
        query = query.gte('monthly_rent', filters.priceMin);
      }
      if (filters?.priceMax) {
        query = query.lte('monthly_rent', filters.priceMax);
      }
      if (filters?.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }
      if (filters?.bedrooms) {
        query = query.gte('bedrooms', filters.bedrooms);
      }
      if (filters?.bathrooms) {
        query = query.gte('bathrooms', filters.bathrooms);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,city.ilike.%${filters.search}%,area.ilike.%${filters.search}%`);
      }

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 10) - 1);
      }

      return query;
    },

    // Get properties by owner
    getByOwner: async (ownerId: string) => {
      return supabase
        .from('properties')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });
    },

    // Get single property
    getById: async (id: string) => {
      return supabase
        .from('properties')
        .select(`
          *,
          profiles!properties_owner_id_fkey (
            full_name,
            phone_number,
            user_role
          )
        `)
        .eq('id', id)
        .single();
    },

    // Create property
    create: async (property: Database['public']['Tables']['properties']['Insert']) => {
      return supabase
        .from('properties')
        .insert(property)
        .select()
        .single();
    },

    // Update property
    update: async (id: string, updates: Database['public']['Tables']['properties']['Update']) => {
      return supabase
        .from('properties')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    },

    // Delete property
    delete: async (id: string) => {
      return supabase
        .from('properties')
        .delete()
        .eq('id', id);
    }
  },

  // Profiles
  profiles: {
    // Get profile by user ID
    getById: async (id: string) => {
      return supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
    },

    // Create profile
    create: async (profile: Database['public']['Tables']['profiles']['Insert']) => {
      return supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();
    },

    // Update profile
    update: async (id: string, updates: Database['public']['Tables']['profiles']['Update']) => {
      return supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    }
  },

  // Property Inquiries
  inquiries: {
    // Get inquiries for landlord
    getByLandlord: async (landlordId: string) => {
      return supabase
        .from('inquiries')
        .select(`
          *,
          properties!property_id (
            title,
            city,
            area,
            monthly_rent
          )
        `)
        .eq('landlord_id', landlordId)
        .order('created_at', { ascending: false });
    },

    // Create inquiry
    create: async (inquiry: Database['public']['Tables']['inquiries']['Insert']) => {
      return supabase
        .from('inquiries')
        .insert(inquiry)
        .select()
        .single();
    },

    // Update inquiry status
    updateStatus: async (id: string, status: 'new' | 'contacted' | 'viewed' | 'closed') => {
      return supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
    }
  }
};

/**
 * STORAGE HELPERS
 * 
 * Helper functions for file upload and management.
 */

export const storage = {
  // Upload avatar image
  uploadAvatar: async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true
      });
    
    if (error) return { data: null, error };
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    return { data: { path: data.path, publicUrl }, error: null };
  },

  // Upload property images
  uploadPropertyImages: async (propertyId: string, files: File[]) => {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${Date.now()}-${index}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);
      
      return publicUrl;
    });
    
    try {
      const urls = await Promise.all(uploadPromises);
      return { data: urls, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete file
  deleteFile: async (bucket: string, path: string) => {
    return supabase.storage
      .from(bucket)
      .remove([path]);
  },

  // Get public URL
  getPublicUrl: (bucket: string, path: string) => {
    return supabase.storage
      .from(bucket)
      .getPublicUrl(path);
  }
};

/**
 * REAL-TIME SUBSCRIPTIONS
 * 
 * Helper functions for setting up real-time subscriptions.
 */

export const realtime = {
  // Subscribe to property changes
  subscribeToProperties: (callback: (payload: any) => void) => {
    return supabase
      .channel('properties')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'properties' }, 
        callback
      )
      .subscribe();
  },

  // Subscribe to inquiries for a landlord
  subscribeToInquiries: (landlordId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('inquiries')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'inquiries',
          filter: `landlord_id=eq.${landlordId}`
        }, 
        callback
      )
      .subscribe();
  }
};

export default supabase;