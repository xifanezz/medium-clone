import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { UserProfile, UpdateUserProfilePayload } from '../types';
import { CloseIcon } from '../Icons'

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updatedProfileData: UpdateUserProfilePayload) => Promise<void>;
  isSaving: boolean;
  saveError: string | null;
}


// A reusable input component for this form
const FormInput: React.FC<{ id: string; name: keyof UpdateUserProfilePayload; label: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string; }> =
  ({ id, name, label, value, onChange, placeholder, type = "text" }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow text-gray-800 placeholder-gray-400"
        placeholder={placeholder}
      />
    </div>
  );


export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  isSaving,
  saveError,
}) => {
  const [formData, setFormData] = useState<UpdateUserProfilePayload>({});

  useEffect(() => {
    // Pre-fill form when the modal opens or the profile data changes
    if (profile && isOpen) {
      setFormData({
        username: profile.username || '',
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        avatar: profile.avatar || '',
        coverImage: profile.coverImage || '',
        location: profile.location || '',
        website: profile.website || '',
      });
    }
  }, [profile, isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // create a payload with only the fields that have changed.
    const changedData: UpdateUserProfilePayload = {};
    for (const key in formData) {
      const typedKey = key as keyof UpdateUserProfilePayload;
      // Compare the current form value with the original profile value
      if (formData[typedKey] !== profile[typedKey as keyof UserProfile]) {
        changedData[typedKey] = formData[typedKey];
      }
    }

    // Only call the onSave function if there are actual changes
    if (Object.keys(changedData).length > 0) {
      await onSave(changedData);
    } else {
      onClose(); // If no changes, just close the modal
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Edit Profile</h3>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Close modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body - Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
              <strong>Error:</strong> {saveError}
            </div>
          )}

          {/* Image Previews */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Avatar & Cover Image</label>
              <div className="relative h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <img src={formData.coverImage || 'https://placehold.co/600x200/EEE/333?text=Cover'} alt="Cover preview" className="w-full h-full object-cover rounded-lg" />
                <div className="absolute -bottom-8 left-6 w-20 h-20 bg-white rounded-full border-4 border-white shadow-md">
                  <img src={formData.avatar || 'https://placehold.co/100x100/EEE/333?text=Avatar'} alt="Avatar preview" className="w-full h-full object-cover rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput id="displayName" name="displayName" label="Display Name" value={formData.displayName || ''} onChange={handleChange} placeholder="e.g., Alex Smith" />
            <FormInput id="username" name="username" label="Username" value={formData.username || ''} onChange={handleChange} placeholder="e.g., cooldev123" />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              id="bio"
              rows={3}
              value={formData.bio || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow text-gray-800 placeholder-gray-400"
              placeholder="Tell us a bit about yourself"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput id="avatar" name="avatar" label="Avatar URL" value={formData.avatar || ''} onChange={handleChange} placeholder="https://..." type="url" />
            <FormInput id="coverImage" name="coverImage" label="Cover Image URL" value={formData.coverImage || ''} onChange={handleChange} placeholder="https://..." type="url" />
            <FormInput id="location" name="location" label="Location" value={formData.location || ''} onChange={handleChange} placeholder="e.g., San Francisco, CA" />
            <FormInput id="website" name="website" label="Website URL" value={formData.website || ''} onChange={handleChange} placeholder="https://..." type="url" />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-100 space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 flex items-center"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
