/**
 * APPLICATION CONSTANTS
 * 
 * Centralized constants for the application.
 */

// Pagination
export const PROPERTIES_PER_PAGE = 9;
export const PROPERTIES_PER_LOAD = 6;

// Price ranges (in TSh)
export const PRICE_RANGES = [
  { label: '200K - 500K', min: 200000, max: 500000 },
  { label: '500K - 1M', min: 500000, max: 1000000 },
  { label: '1M - 2M', min: 1000000, max: 2000000 },
  { label: '2M+', min: 2000000, max: null },
];

// Property types
export const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'studio', label: 'Studio' },
  { value: 'villa', label: 'Villa' },
  { value: 'room', label: 'Room' },
];

// Tanzanian cities
export const TANZANIAN_CITIES = [
  'Dar es Salaam',
  'Mwanza',
  'Arusha',
  'Mbeya',
  'Morogoro',
  'Tanga',
  'Dodoma',
  'Moshi',
  'Iringa',
  'Mtwara',
];

// Common amenities
export const COMMON_AMENITIES = [
  'Parking',
  'Security',
  'Generator',
  'Water Tank',
  'Garden',
  'Balcony',
  'Air Conditioning',
  'Internet',
  'Swimming Pool',
  'Gym',
  'Elevator',
  'Furnished',
  'CCTV',
  'Kitchen',
  'Dining Room',
];

// Contact methods
export const CONTACT_METHODS = [
  { value: 'phone', label: 'Phone Call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
];

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 5,
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

// API endpoints
export const API_ENDPOINTS = {
  PROPERTIES: '/api/properties',
  USERS: '/api/users',
  INQUIRIES: '/api/inquiries',
  UPLOAD: '/api/upload',
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'nyumbatz_auth_token',
  USER_PREFERENCES: 'nyumbatz_user_preferences',
  SEARCH_HISTORY: 'nyumbatz_search_history',
  FAVORITES: 'nyumbatz_favorites',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You need to be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  PROPERTY_CREATED: 'Property created successfully!',
  PROPERTY_UPDATED: 'Property updated successfully!',
  PROPERTY_DELETED: 'Property deleted successfully!',
  INQUIRY_SENT: 'Your inquiry has been sent successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};

// Validation rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(\+255|0)[67]\d{8}$/,
  PASSWORD_MIN_LENGTH: 6,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
};

// Theme colors
export const THEME_COLORS = {
  primary: '#0ea5e9',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};