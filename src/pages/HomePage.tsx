/**
 * HOMEPAGE COMPONENT - MAIN APPLICATION PAGE
 * 
 * This is the primary page component that orchestrates the entire property search experience.
 * It manages the application state, handles search functionality, and coordinates between components.
 * 
 * KEY FEATURES:
 * - Property search and filtering with real-time results
 * - Responsive grid/list view toggle (desktop only)
 * - Infinite scroll with "Load More" functionality
 * - Advanced search with multiple filter criteria
 * - Property details modal/page navigation
 * - Search result management and display
 * - Mobile-first responsive design
 * 
 * STATE MANAGEMENT:
 * - Properties data (mock data, will be API in production)
 * - Filtered and displayed properties
 * - Search filters and query state
 * - Pagination and loading states
 * - View mode and UI preferences
 * 
 * SEARCH FUNCTIONALITY:
 * - Text-based search with intelligent matching
 * - Price range filtering with flexible input
 * - Location-based filtering
 * - Property type and amenity filtering
 * - Real-time search from header component
 * - Search result highlighting and management
 * 
 * SCALABILITY NOTES:
 * - Easy to replace mock data with API calls
 * - Pagination system ready for large datasets
 * - Filter system extensible for new criteria
 * - Component structure supports A/B testing
 * - Performance optimized with proper state management
 */

import React, { useState, useEffect } from 'react';
import { Grid, List, SlidersHorizontal, ChevronDown } from 'lucide-react';
import Hero from '../components/Hero';
import PropertyCard from '../components/PropertyCard';
import SearchFilters from '../components/SearchFilters';
import PropertyDetails from '../components/PropertyDetails';
import { db, isSupabaseConfigured } from '../lib/supabase';
import { Property, SearchFilters as SearchFiltersType } from '../types';
import { mockProperties } from '../data/mockData';

/**
 * PAGINATION CONFIGURATION
 * 
 * Controls how many properties are displayed initially and on subsequent loads.
 * Optimized for performance and user experience.
 */
const PROPERTIES_PER_PAGE = 9; // Initial load: 9 properties (3x3 grid)
// Subsequent loads: 6 properties each time for consistent UX

/**
 * CONVERT DATABASE PROPERTY TO APP PROPERTY FORMAT
 * 
 * Converts the database property format to match the app's Property interface.
 */
const convertDbPropertyToAppProperty = (dbProperty: any): Property => {
  return {
    id: dbProperty.id,
    ownerId: dbProperty.owner_id,
    title: dbProperty.title,
    description: dbProperty.description,
    priceMonthly: dbProperty.monthly_rent,
    location: {
      address: '',
      city: dbProperty.city,
      district: dbProperty.area,
      neighborhood: dbProperty.area
    },
    bedrooms: dbProperty.bedrooms,
    bathrooms: dbProperty.bathrooms,
    propertyType: dbProperty.property_type as 'house' | 'apartment' | 'studio' | 'villa' | 'room',
    amenities: dbProperty.amenities || [],
    images: dbProperty.images || ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
    status: dbProperty.is_available ? 'available' : 'rented' as 'available' | 'rented' | 'maintenance',
    createdDate: dbProperty.created_at,
    updatedDate: dbProperty.updated_at,
    featured: false // You can add a featured column to the database later
  };
};

/**
 * HOMEPAGE COMPONENT IMPLEMENTATION
 * 
 * Main page component managing property search and display functionality.
 */
export default function HomePage() {
  // ... rest of the code remains the same ...
}