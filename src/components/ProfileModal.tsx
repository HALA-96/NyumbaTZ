/**
 * PROFILE MODAL COMPONENT
 * 
 * Modal for viewing and editing user profile information.
 * Includes avatar upload functionality.
 */

import React, { useState } from 'react';
import { X, Camera, User, Mail, Phone, MapPin, Edit2, Save, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { validatePhoneNumber, validateRequired } from '../utils/validators';
import { formatPhoneNumber, getInitials, generateAvatarColor } from '../utils/formatters';
import Button from './ui/Button';
import Input from './ui/Input';
import LoadingSpinner from './ui/LoadingSpinner';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileFormData {
  fullName: string;
  phoneNumber: string;
  bio: string;
  location: string;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile, uploadAvatar } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form setup
  const form = useForm<ProfileFormData>({
    defaultValues: {
      fullName: profile?.full_name || '',
      phoneNumber: profile?.phone_number || '',
      bio: profile?.bio || '',
      location: profile?.location || ''
    }
  });

  // Reset form when profile changes
  React.useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.full_name || '',
        phoneNumber: profile.phone_number || '',
        bio: profile.bio || '',
        location: profile.location || ''
      });
    }
  }, [profile, form]);

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast.error('Image size must be less than 2MB');
      return;
    }

    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setUploadingAvatar(true);
    try {
      const { error } = await uploadAvatar(avatarFile);
      
      if (error) {
        toast.error(error.message || 'Failed to upload avatar');
        return;
      }
      
      toast.success('Avatar updated successfully!');
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (data: ProfileFormData) => {
    try {
      const { error } = await updateProfile({
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        bio: data.bio,
        location: data.location
      });
      
      if (error) {
        toast.error(error.message || 'Failed to update profile');
        return;
      }
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  if (!isOpen || !user || !profile) return null;

  const avatarUrl = avatarPreview || profile.avatar_url;
  const initials = getInitials(profile.full_name || user.email || 'User');
  const avatarColor = generateAvatarColor(profile.full_name || user.email || 'User');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Profile' : 'My Profile'}
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
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>
              )}
              
              {/* Upload button */}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Upload avatar button */}
            {avatarFile && (
              <Button
                onClick={handleAvatarUpload}
                loading={uploadingAvatar}
                size="sm"
                className="mt-3"
                icon={<Upload className="h-4 w-4" />}
              >
                Upload Avatar
              </Button>
            )}

            <div className="text-center mt-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {profile.full_name || 'User'}
              </h3>
              <p className="text-sm text-gray-500 capitalize">
                {profile.user_role}
              </p>
              {profile.is_verified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-4">
            <Input
              label="Full Name"
              icon={<User className="h-5 w-5 text-gray-400" />}
              disabled={!isEditing}
              {...form.register('fullName', {
                required: 'Full name is required',
                validate: (value) => validateRequired(value, 'Full name')
              })}
              error={form.formState.errors.fullName?.message}
            />

            <Input
              label="Email Address"
              type="email"
              value={user.email || ''}
              icon={<Mail className="h-5 w-5 text-gray-400" />}
              disabled
              helperText="Email cannot be changed"
            />

            <Input
              label="Phone Number"
              type="tel"
              icon={<Phone className="h-5 w-5 text-gray-400" />}
              disabled={!isEditing}
              {...form.register('phoneNumber', {
                validate: (value) => !value || validatePhoneNumber(value)
              })}
              error={form.formState.errors.phoneNumber?.message}
            />

            <Input
              label="Location"
              icon={<MapPin className="h-5 w-5 text-gray-400" />}
              placeholder="e.g., Dar es Salaam, Tanzania"
              disabled={!isEditing}
              {...form.register('location')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                {...form.register('bio')}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={form.formState.isSubmitting}
                    icon={<Save className="h-4 w-4" />}
                    className="flex-1"
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  icon={<Edit2 className="h-4 w-4" />}
                  className="w-full"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </form>

          {/* Account Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Account Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">User Role:</span>
                <span className="text-gray-900 capitalize">{profile.user_role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Member Since:</span>
                <span className="text-gray-900">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email Verified:</span>
                <span className={`${profile.email_verified ? 'text-green-600' : 'text-red-600'}`}>
                  {profile.email_verified ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;