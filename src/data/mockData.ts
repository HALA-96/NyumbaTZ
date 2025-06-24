/**
 * MOCK DATA FOR DEVELOPMENT AND TESTING
 * 
 * This file contains sample property data used for development and testing.
 * In production, this data would come from the Supabase database.
 */

import { Property } from '../types';

export const mockProperties: Property[] = [
  {
    id: '1',
    ownerId: 'owner-1',
    title: 'Modern 3BR House in Masaki',
    description: 'Beautiful modern house in the prestigious Masaki area with sea views. Perfect for professionals and families. Fully furnished with modern amenities including air conditioning, generator backup, and 24/7 security.',
    priceMonthly: 1200000,
    location: {
      address: 'Masaki Peninsula',
      city: 'Dar es Salaam',
      district: 'Masaki',
      neighborhood: 'Masaki'
    },
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'house',
    amenities: ['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Air Conditioning', 'Internet', 'Furnished'],
    images: [
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'available',
    createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    featured: true
  },
  {
    id: '2',
    ownerId: 'owner-1',
    title: 'Cozy 2BR Apartment in Mikocheni',
    description: 'Well-maintained 2-bedroom apartment in Mikocheni. Close to shopping centers and public transport. Features include parking space, water tank, and reliable internet connection.',
    priceMonthly: 550000,
    location: {
      address: 'Mikocheni B',
      city: 'Dar es Salaam',
      district: 'Mikocheni',
      neighborhood: 'Mikocheni'
    },
    bedrooms: 2,
    bathrooms: 1,
    propertyType: 'apartment',
    amenities: ['Parking', 'Security', 'Water Tank', 'Internet', 'Balcony'],
    images: [
      'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'available',
    createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    featured: false
  },
  {
    id: '3',
    ownerId: 'owner-1',
    title: 'Luxury Villa in Oyster Bay',
    description: 'Stunning luxury villa with ocean views in Oyster Bay. Features spacious rooms, private garden, swimming pool, and top-notch security. Perfect for executives and diplomats.',
    priceMonthly: 2500000,
    location: {
      address: 'Oyster Bay Road',
      city: 'Dar es Salaam',
      district: 'Oyster Bay',
      neighborhood: 'Oyster Bay'
    },
    bedrooms: 4,
    bathrooms: 3,
    propertyType: 'villa',
    amenities: ['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Swimming Pool', 'Air Conditioning', 'Internet', 'Furnished'],
    images: [
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'available',
    createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    featured: true
  },
  {
    id: '4',
    ownerId: 'owner-1',
    title: 'Executive House in Mwanza City',
    description: 'Executive 4-bedroom house near Lake Victoria. Perfect for business executives with family. Features include large compound, parking for 3 cars, generator, and beautiful lake views.',
    priceMonthly: 800000,
    location: {
      address: 'Ilemela District',
      city: 'Mwanza',
      district: 'Ilemela',
      neighborhood: 'Ilemela'
    },
    bedrooms: 4,
    bathrooms: 3,
    propertyType: 'house',
    amenities: ['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Internet'],
    images: [
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'available',
    createdDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    featured: false
  },
  {
    id: '5',
    ownerId: 'owner-1',
    title: 'Modern Studio in Mbeya',
    description: 'Compact modern studio apartment perfect for students and young professionals in Mbeya. Features include kitchenette, private bathroom, and reliable internet.',
    priceMonthly: 280000,
    location: {
      address: 'Mbeya Urban',
      city: 'Mbeya',
      district: 'Mbeya Urban',
      neighborhood: 'Mbeya Urban'
    },
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'studio',
    amenities: ['Security', 'Internet'],
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'available',
    createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    featured: false
  },
  {
    id: '6',
    ownerId: 'owner-1',
    title: 'Safari Lodge Style House in Arusha',
    description: 'Unique safari lodge style house in Arusha, perfect for tourists and expatriates. Close to Mount Meru with stunning mountain views. Features include fireplace, large garden, and traditional Tanzanian architecture.',
    priceMonthly: 950000,
    location: {
      address: 'Arusha Central',
      city: 'Arusha',
      district: 'Arusha Central',
      neighborhood: 'Arusha Central'
    },
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'house',
    amenities: ['Parking', 'Security', 'Water Tank', 'Garden', 'Internet'],
    images: [
      'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'available',
    createdDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    featured: false
  },
  {
    id: '7',
    ownerId: 'owner-1',
    title: 'Family Apartment in Mbeya Highlands',
    description: 'Spacious 3-bedroom apartment in the cool highlands of Mbeya. Perfect for families with children. Features include balcony with mountain views, parking, and proximity to schools.',
    priceMonthly: 450000,
    location: {
      address: 'Mbeya Highlands',
      city: 'Mbeya',
      district: 'Mbeya Highlands',
      neighborhood: 'Mbeya Highlands'
    },
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'apartment',
    amenities: ['Security', 'Water Tank', 'Internet'],
    images: [
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'available',
    createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    featured: false
  },
  {
    id: '8',
    ownerId: 'owner-1',
    title: 'Single Room in Temeke',
    description: 'Affordable single room in Temeke area. Perfect for students and young professionals. Shared bathroom and kitchen facilities. Close to public transport and markets.',
    priceMonthly: 180000,
    location: {
      address: 'Temeke District',
      city: 'Dar es Salaam',
      district: 'Temeke',
      neighborhood: 'Temeke'
    },
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'room',
    amenities: ['Security'],
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'available',
    createdDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    featured: false
  },
  {
    id: '9',
    ownerId: 'owner-1',
    title: 'University Area House in Morogoro',
    description: 'Perfect for university staff and families. 3-bedroom house near Sokoine University of Agriculture. Features include large compound, fruit trees, and quiet neighborhood.',
    priceMonthly: 600000,
    location: {
      address: 'University Area',
      city: 'Morogoro',
      district: 'University Area',
      neighborhood: 'University Area'
    },
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'house',
    amenities: ['Parking', 'Security', 'Water Tank', 'Garden', 'Internet'],
    images: [
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'available',
    createdDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updatedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    featured: false
  }
];

// Export individual arrays for backward compatibility
export const tanzanianCities = [
  'Dar es Salaam',
  'Mwanza',
  'Arusha',
  'Mbeya',
  'Morogoro',
  'Tanga',
  'Dodoma',
  'Moshi',
  'Iringa',
  'Mtwara'
];

export const propertyTypes = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'studio', label: 'Studio' },
  { value: 'villa', label: 'Villa' },
  { value: 'room', label: 'Room' }
];

export const amenities = [
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
  'Dining Room'
];