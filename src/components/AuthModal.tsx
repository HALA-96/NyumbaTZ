/**
 * AUTHENTICATION MODAL COMPONENT
 * 
 * Modal component for user login and registration.
 * Provides a clean, mobile-friendly interface for authentication.
 * 
 * KEY FEATURES:
 * - Login and registration forms
 * - Role selection (tenant/landlord)
 * - Form validation
 * - Error handling
 * - Loading states
 * - Mobile-responsive design
 * 
 * MVP FOCUS:
 * - Simple email/password authentication
 * - Clear user role selection
 * - Good user experience
 * - Proper error messages
 */

import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword, validatePhoneNumber, validateRequired } from '../utils/validators';
import Button from './ui/Button';
import Input from './ui/Input';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  userRole: 'tenant' | 'landlord';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultMode = 'login' 
}) => {
  // State
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [showPassword, setShowPassword] = useState(false);


  // Auth context
  const { signIn, signUp, resetPassword } = useAuth();

  // Login form
  const loginForm = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
      userRole: 'tenant'
    }
  });

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      loginForm.reset();
      registerForm.reset();
      setMode(defaultMode);
      setShowPassword(false);
    }
  }, [isOpen, defaultMode, loginForm, registerForm]);

  // Handle login
  const handleLogin = async (data: LoginFormData) => {
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        if (error.message?.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else if (error.message?.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account before signing in.');
        } else {
          toast.error(error.message || 'Failed to sign in. Please try again.');
        }
        return;
      }
      
      toast.success('Successfully signed in!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.');
    }
  };

  // Handle registration
  const handleRegister = async (data: RegisterFormData) => {
    try {
      const { error } = await signUp(data.email, data.password, {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        userRole: data.userRole
      });
      
      if (error) {
        if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
          toast.error('An account with this email already exists. Please try signing in instead.');
        } else if (error.message?.includes('Invalid email')) {
          toast.error('Please enter a valid email address.');
        } else if (error.message?.includes('Password')) {
          toast.error('Password must be at least 6 characters long.');
        } else {
          toast.error(error.message || 'Failed to create account. Please try again.');
        }
        return;
      }
      
      toast.success('Account created successfully! Please check your email to confirm your account.');
      setMode('login');
      registerForm.reset();
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.');
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    const email = loginForm.getValues('email');
    
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast.error(error.message || 'Failed to send reset email.');
      } else {
        toast.success('Password reset email sent! Please check your inbox.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email.');
    }
  };

  // Get current form
  const currentForm = mode === 'login' ? loginForm : registerForm;
  const isLoading = currentForm.formState.isSubmitting;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                icon={<Mail className="h-5 w-5 text-gray-400" />}
                placeholder="Enter your email"
                {...loginForm.register('email', {
                  required: 'Email is required',
                  validate: validateEmail
                })}
                error={loginForm.formState.errors.email?.message}
              />

              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  icon={<Lock className="h-5 w-5 text-gray-400" />}
                  placeholder="Enter your password"
                  {...loginForm.register('password', {
                    required: 'Password is required',
                    validate: validatePassword
                  })}
                  error={loginForm.formState.errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  style={{ marginTop: '12px' }}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
              >
                Sign In
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                icon={<User className="h-5 w-5 text-gray-400" />}
                placeholder="Enter your full name"
                {...registerForm.register('fullName', {
                  required: 'Full name is required',
                  validate: (value) => validateRequired(value, 'Full name')
                })}
                error={registerForm.formState.errors.fullName?.message}
              />

              <Input
                label="Phone Number"
                type="tel"
                icon={<Phone className="h-5 w-5 text-gray-400" />}
                placeholder="e.g., 0712345678"
                {...registerForm.register('phoneNumber', {
                  required: 'Phone number is required',
                  validate: validatePhoneNumber
                })}
                error={registerForm.formState.errors.phoneNumber?.message}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  I am a
                </label>
                <select
                  {...registerForm.register('userRole', {
                    required: 'Please select your role'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="tenant">Tenant (Looking for property)</option>
                  <option value="landlord">Landlord (Have property to rent)</option>
                </select>
                {registerForm.formState.errors.userRole && (
                  <p className="text-sm text-red-600 mt-1">
                    {registerForm.formState.errors.userRole.message}
                  </p>
                )}
              </div>

              <Input
                label="Email Address"
                type="email"
                icon={<Mail className="h-5 w-5 text-gray-400" />}
                placeholder="Enter your email"
                {...registerForm.register('email', {
                  required: 'Email is required',
                  validate: validateEmail
                })}
                error={registerForm.formState.errors.email?.message}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  icon={<Lock className="h-5 w-5 text-gray-400" />}
                  placeholder="Enter your password"
                  {...registerForm.register('password', {
                    required: 'Password is required',
                    validate: validatePassword
                  })}
                  error={registerForm.formState.errors.password?.message}
                  helperText="Password must be at least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  style={{ marginTop: '12px' }}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
              >
                Create Account
              </Button>
            </form>
          )}

          {/* Old form code removed for brevity */}
          {/* <form onSubmit={handleSubmit} className="space-y-4">
            {/* Registration Fields */}
          {/* </form> */}

          {/* Mode Switch */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  loginForm.reset();
                  registerForm.reset();
                }}
                className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Terms for Registration */}
          {mode === 'register' && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;