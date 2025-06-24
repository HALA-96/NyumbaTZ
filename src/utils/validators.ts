/**
 * VALIDATION UTILITIES
 * 
 * Common validation functions for forms and data.
 */

import { VALIDATION } from './constants';

/**
 * Validate email address
 */
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email is required';
  }
  
  if (!VALIDATION.EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

/**
 * Validate password
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`;
  }
  
  return null;
};

/**
 * Validate Tanzanian phone number
 */
export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone) {
    return 'Phone number is required';
  }
  
  const cleaned = phone.replace(/\s/g, '');
  
  if (!VALIDATION.PHONE_REGEX.test(cleaned)) {
    return 'Please enter a valid Tanzanian phone number (e.g., 0712345678)';
  }
  
  return null;
};

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  
  return null;
};

/**
 * Validate text length
 */
export const validateLength = (
  value: string,
  fieldName: string,
  minLength?: number,
  maxLength?: number
): string | null => {
  if (minLength && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  
  if (maxLength && value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters`;
  }
  
  return null;
};

/**
 * Validate numeric value
 */
export const validateNumber = (
  value: string | number,
  fieldName: string,
  min?: number,
  max?: number
): string | null => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (min !== undefined && num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  
  if (max !== undefined && num > max) {
    return `${fieldName} must be no more than ${max}`;
  }
  
  return null;
};

/**
 * Validate file upload
 */
export const validateFile = (
  file: File,
  maxSize: number,
  allowedTypes: string[]
): string | null => {
  if (file.size > maxSize) {
    return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
  }
  
  if (!allowedTypes.includes(file.type)) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
  }
  
  return null;
};

/**
 * Validate property form data
 */
export const validatePropertyForm = (data: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Title validation
  const titleError = validateRequired(data.title, 'Title') ||
    validateLength(data.title, 'Title', 5, VALIDATION.TITLE_MAX_LENGTH);
  if (titleError) errors.title = titleError;
  
  // Description validation
  const descriptionError = validateRequired(data.description, 'Description') ||
    validateLength(data.description, 'Description', 20, VALIDATION.DESCRIPTION_MAX_LENGTH);
  if (descriptionError) errors.description = descriptionError;
  
  // Price validation
  const priceError = validateNumber(data.price, 'Price', 50000, 10000000);
  if (priceError) errors.price = priceError;
  
  // Bedrooms validation
  const bedroomsError = validateNumber(data.bedrooms, 'Bedrooms', 0, 10);
  if (bedroomsError) errors.bedrooms = bedroomsError;
  
  // Bathrooms validation
  const bathroomsError = validateNumber(data.bathrooms, 'Bathrooms', 0, 10);
  if (bathroomsError) errors.bathrooms = bathroomsError;
  
  // City validation
  const cityError = validateRequired(data.city, 'City');
  if (cityError) errors.city = cityError;
  
  // Area validation
  const areaError = validateRequired(data.area, 'Area');
  if (areaError) errors.area = areaError;
  
  // Phone validation
  const phoneError = validatePhoneNumber(data.phone);
  if (phoneError) errors.phone = phoneError;
  
  return errors;
};

/**
 * Validate user registration form
 */
export const validateRegistrationForm = (data: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Full name validation
  const nameError = validateRequired(data.fullName, 'Full name') ||
    validateLength(data.fullName, 'Full name', 2, 50);
  if (nameError) errors.fullName = nameError;
  
  // Email validation
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  
  // Password validation
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;
  
  // Phone validation
  const phoneError = validatePhoneNumber(data.phoneNumber);
  if (phoneError) errors.phoneNumber = phoneError;
  
  // User role validation
  if (!data.userRole || !['tenant', 'landlord'].includes(data.userRole)) {
    errors.userRole = 'Please select a valid user role';
  }
  
  return errors;
};

/**
 * Check if form has errors
 */
export const hasErrors = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Get first error message
 */
export const getFirstError = (errors: Record<string, string>): string | null => {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : null;
};