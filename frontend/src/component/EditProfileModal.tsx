import React, { useState, useEffect, ChangeEvent, FormEvent} from 'react';
import { UserProfile, UpdateUserProfilePayload } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { UploadCloud } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updatedProfileData: UpdateUserProfilePayload) => Promise<void>;
  isSaving: boolean;
  saveError: string | null;
}

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

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
  
  // State for file uploads
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // State for image previews
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const { user: currentUser } = useAuth();

  useEffect(() => {
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
      // Set initial previews
      setAvatarPreview(profile.avatar || null);
      setCoverPreview(profile.coverImage || null);
      // Reset file states
      setAvatarFile(null);
      setCoverFile(null);
    }
  }, [profile, isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Helper function for uploading files
  const uploadFile = async (file: File, bucket: 'avatars' | 'covers'): Promise<string | null> => {
      if (!currentUser) return null;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.error(`Error uploading to ${bucket}:`, error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
        
      return publicUrl;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let updatedData = { ...formData };

    // Upload avatar if a new one was selected
    if (avatarFile) {
      const newAvatarUrl = await uploadFile(avatarFile, 'avatars');
      if (newAvatarUrl) updatedData.avatar = newAvatarUrl;
    }

    // Upload cover image if a new one was selected
    if (coverFile) {
        const newCoverUrl = await uploadFile(coverFile, 'covers');
        if (newCoverUrl) updatedData.coverImage = newCoverUrl;
    }
    
    // Compare with original profile to find what actually changed
    const changedData: UpdateUserProfilePayload = {};
    for (const key in updatedData) {
      const typedKey = key as keyof UpdateUserProfilePayload;
      const formValue = updatedData[typedKey] || '';
      const profileValue = (profile[typedKey as keyof UserProfile] as string | undefined) || '';
      if (formValue !== profileValue) {
        changedData[typedKey] = updatedData[typedKey];
      }
    }

    if (Object.keys(changedData).length > 0) {
      await onSave(changedData);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col font-sans">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Edit Profile</h3>
          <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
          {saveError && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm"><strong>Error:</strong> {saveError}</div>}
          
          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
            <div className="relative h-32 bg-gray-100 rounded-lg flex items-center justify-center group">
                <img src={coverPreview || 'https://placehold.co/600x200/EEE/333?text=Cover'} alt="Cover preview" className="w-full h-full object-cover rounded-lg" />
                <label htmlFor="cover-upload" className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center cursor-pointer">
                    <UploadCloud size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </label>
                <input id="cover-upload" name="cover" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleCoverChange} />
            </div>
          </div>

          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0 group">
              <img src={avatarPreview || 'https://placehold.co/100x100/EEE/333?text=Avatar'} alt="Avatar preview" className="w-24 h-24 object-cover rounded-full" />
              <label htmlFor="avatar-upload" className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center cursor-pointer rounded-full">
                  <UploadCloud size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </label>
              <input id="avatar-upload" name="avatar" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleAvatarChange} />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Profile Picture</p>
                <p className="text-xs text-gray-500 mt-1">PNG or JPG. 800x800px recommended.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput id="displayName" name="displayName" label="Display Name" value={formData.displayName || ''} onChange={handleChange} />
            <FormInput id="username" name="username" label="Username" value={formData.username || ''} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea name="bio" id="bio" rows={3} value={formData.bio || ''} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput id="location" name="location" label="Location" value={formData.location || ''} onChange={handleChange} />
            <FormInput id="website" name="website" label="Website URL" value={formData.website || ''} onChange={handleChange} type="url" />
          </div>
        </form>
        <div className="flex items-center justify-end p-6 border-t border-gray-100 space-x-3">
          <button type="button" onClick={onClose} disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" onClick={handleSubmit} disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center">
            {isSaving ? (<><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Saving...</>) : ('Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
};
