/**
 * PROPERTIES HOOK - CENTRALIZED PROPERTY DATA MANAGEMENT
 * 
 * Custom hook for managing property data with React Query integration.
 * Provides caching, background updates, and optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, isSupabaseConfigured } from '../lib/supabase';
import { Property, SearchFilters } from '../types';

// Query keys for React Query
export const PROPERTY_KEYS = {
  all: ['properties'] as const,
  lists: () => [...PROPERTY_KEYS.all, 'list'] as const,
  list: (filters: SearchFilters) => [...PROPERTY_KEYS.lists(), filters] as const,
  details: () => [...PROPERTY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PROPERTY_KEYS.details(), id] as const,
  byOwner: (ownerId: string) => [...PROPERTY_KEYS.all, 'owner', ownerId] as const,
};

/**
 * Convert database property to app property format
 */
const convertDbPropertyToAppProperty = (dbProperty: any): Property => {
  return {
    id: dbProperty.id,
    ownerId: dbProperty.owner_id,
    title: dbProperty.title,
    description: dbProperty.description,
    priceMonthly: dbProperty.price_monthly,
    location: {
      address: dbProperty.address || '',
      city: dbProperty.city,
      district: dbProperty.area,
      neighborhood: dbProperty.area
    },
    bedrooms: dbProperty.bedrooms,
    bathrooms: dbProperty.bathrooms,
    propertyType: dbProperty.property_type as Property['propertyType'],
    amenities: dbProperty.amenities || [],
    images: dbProperty.images || ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
    status: dbProperty.is_available ? 'available' : 'rented' as Property['status'],
    createdDate: dbProperty.created_at,
    updatedDate: dbProperty.updated_at,
    featured: dbProperty.is_featured || false
  };
};

/**
 * Hook for fetching properties with filters
 */
export const useProperties = (filters: SearchFilters = {}) => {
  return useQuery({
    queryKey: PROPERTY_KEYS.list(filters),
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        // Filter mock data based on filters
        const { mockProperties } = await import('../data/mockData');
        let filtered = [...mockProperties];
        
        if (filters.location) {
          filtered = filtered.filter(p => 
            p.location.city.toLowerCase().includes(filters.location!.toLowerCase())
          );
        }
        
        if (filters.priceMin) {
          filtered = filtered.filter(p => p.priceMonthly >= filters.priceMin!);
        }
        
        if (filters.priceMax) {
          filtered = filtered.filter(p => p.priceMonthly <= filters.priceMax!);
        }
        
        if (filters.propertyType) {
          filtered = filtered.filter(p => p.propertyType === filters.propertyType);
        }
        
        if (filters.bedrooms) {
          filtered = filtered.filter(p => p.bedrooms >= filters.bedrooms!);
        }
        
        if (filters.bathrooms) {
          filtered = filtered.filter(p => p.bathrooms >= filters.bathrooms!);
        }
        
        return filtered;
      }

      const { data, error } = await db.properties.getAll(filters);
      
      if (error) throw error;
      
      return data?.map(convertDbPropertyToAppProperty) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for fetching a single property
 */
export const useProperty = (id: string) => {
  return useQuery({
    queryKey: PROPERTY_KEYS.detail(id),
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        const { mockProperties } = await import('../data/mockData');
        return mockProperties.find(p => p.id === id) || null;
      }

      const { data, error } = await db.properties.getById(id);
      
      if (error) throw error;
      
      return data ? convertDbPropertyToAppProperty(data) : null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for fetching properties by owner
 */
export const usePropertiesByOwner = (ownerId: string) => {
  return useQuery({
    queryKey: PROPERTY_KEYS.byOwner(ownerId),
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        const { mockProperties } = await import('../data/mockData');
        return mockProperties.filter(p => p.ownerId === ownerId);
      }

      const { data, error } = await db.properties.getByOwner(ownerId);
      
      if (error) throw error;
      
      return data?.map(convertDbPropertyToAppProperty) || [];
    },
    enabled: !!ownerId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook for creating a property
 */
export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (propertyData: any) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await db.properties.create(propertyData);
      
      if (error) throw error;
      
      return convertDbPropertyToAppProperty(data);
    },
    onSuccess: (newProperty) => {
      // Invalidate and refetch properties
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.byOwner(newProperty.ownerId) });
    },
  });
};

/**
 * Hook for updating a property
 */
export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await db.properties.update(id, updates);
      
      if (error) throw error;
      
      return convertDbPropertyToAppProperty(data);
    },
    onSuccess: (updatedProperty) => {
      // Update cache
      queryClient.setQueryData(
        PROPERTY_KEYS.detail(updatedProperty.id),
        updatedProperty
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.byOwner(updatedProperty.ownerId) });
    },
  });
};

/**
 * Hook for deleting a property
 */
export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured');
      }

      const { error } = await db.properties.delete(id);
      
      if (error) throw error;
      
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: PROPERTY_KEYS.detail(deletedId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.all });
    },
  });
};

/**
 * Hook for incrementing property views
 */
export const useIncrementViews = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (propertyId: string) => {
      if (!isSupabaseConfigured) {
        return;
      }

      const { error } = await db.properties.incrementViews(propertyId);
      
      if (error) throw error;
    },
    onSuccess: (_, propertyId) => {
      // Optimistically update view count
      queryClient.setQueryData(
        PROPERTY_KEYS.detail(propertyId),
        (old: Property | undefined) => {
          if (!old) return old;
          return { ...old, views: (old.views || 0) + 1 };
        }
      );
    },
  });
};