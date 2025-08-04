// src/pages/Profile.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserProfile, Post, UpdateUserProfilePayload } from '../types';
import { api } from "../api";
import { ProfileHeader } from '../component/Profileheader';
import { ProfileInfo } from '../component/Profileinfo';
import { NavigationTabs } from '../component/Navigationtabs';
import { PostsList } from '../component/Postlist';
import { ProfilePageSkeleton } from '../component/Skeleton';
import { EditProfileModal } from '../component/EditProfileModal';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'bookmarks'>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const { username } = useParams<{ username: string }>();

  const navigate = useNavigate();
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();


  useEffect(() => {
    const loadProfile = async () => {
      if (isAuthLoading) return;

      const targetUsername = username || currentUser?.user_metadata?.username;


      if (!targetUsername) {
        setError('Please log in to view your profile.');
        setIsProfileLoading(false);
        return;
      }

      try {
        setIsProfileLoading(true);
        setError(null);
        const profileData = await api.getUserProfile(targetUsername);
        setProfile(profileData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsProfileLoading(false);
      }
    };
    loadProfile();
  }, [username, currentUser, isAuthLoading]);

  useEffect(() => {
    const loadTabData = async () => {
      if (!profile) return;

      if (activeTab === 'bookmarks' && !profile.isOwnProfile) {
        setActiveTab('home');
        return;
      }

      if (activeTab === 'home' && profile.username) {
        setIsLoadingPosts(true);
        try {
          const postsData = await api.getUserPosts(profile.username);
          setPosts(postsData.data);
        } catch (err) {
          console.error('Failed to load posts:', err);
        } finally {
          setIsLoadingPosts(false);
        }
      } else if (activeTab === 'bookmarks' && profile.isOwnProfile) {
        setIsLoadingBookmarks(true);
        try {
          const response = await api.getUserBookmarks();
          const formattedPosts = response.data.map((item: any) => ({
            id: parseInt(item.id, 10),
            title: item.title,
            description: item.description,
            createdAt: item.createdAt,
            readTime: item.readTime,
            imageUrl: item.imageUrl,
            author: {
              username: item.User.username,
              displayName: item.User.displayName,
              avatar: item.User.avatar,
            },
            clapCount: item.clapCount,
            responseCount: item.responseCount,
            tags: item.tags,
            isBookmarked: true,
            isClapped: false,
            bookmarkCount: 0,
          }));
          setBookmarks(formattedPosts);
        } catch (err) {
          console.error('Failed to load bookmarks:', err);
        } finally {
          setIsLoadingBookmarks(false);
        }
      }
    };

    loadTabData();
  }, [activeTab, profile]);

  const handleOpenEditModal = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);


  const handleSaveProfile = async (updatedData: UpdateUserProfilePayload) => {
    if (!profile) return;
    setIsSavingProfile(true);
    setProfileSaveError(null);
    try {
      const updatedProfile = await api.updateUserProfile(updatedData);

      // Step 2 :only include fields that were actually changed and are relevant to the session.
      const supabaseMetadataUpdate: { [key: string]: any } = {};
      if (updatedData.avatar !== undefined) {
        supabaseMetadataUpdate.avatar_url = updatedData.avatar;
      }
      if (updatedData.displayName !== undefined) {
        supabaseMetadataUpdate.full_name = updatedData.displayName;
      }
      if (updatedData.username !== undefined) {
        supabaseMetadataUpdate.username = updatedData.username;
      }

      // Step 3: If there are changes to sync, update Supabase Auth.
      // This will trigger our onAuthStateChange listener and update the header.
      if (Object.keys(supabaseMetadataUpdate).length > 0) {
        const { error: supabaseError } = await supabase.auth.updateUser({
          data: supabaseMetadataUpdate
        });

        if (supabaseError) {
          // Log the error but don't fail the whole operation, as our DB is already updated.
          console.warn("Failed to sync profile changes with Supabase Auth:", supabaseError);
        }
      }

      // Step 4: Update the local React state to reflect the changes immediately.
      setProfile(updatedProfile);
      setIsEditModalOpen(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile.';
      setProfileSaveError(errorMessage);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profile) return;
    setIsFollowLoading(true);
    try {
      const result = await api.toggleFollow(profile.username);
      setProfile(prev => prev ? ({ ...prev, isFollowing: result.isFollowing, followersCount: result.isFollowing ? prev.followersCount + 1 : prev.followersCount - 1 }) : null);
    } catch (error) {
      console.error("Failed to toggle follow", error);
    } finally {
      setIsFollowLoading(false);
    }
  };


  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <main className="py-8">
          <ProfilePageSkeleton />
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center space-y-4 bg-gray-50 p-8 rounded-xl shadow-sm">
          <h2 className="text-xl font-sans font-medium text-gray-900">Profile Not Found</h2>
          <p className="text-gray-500 text-sm max-w-sm font-sans">
            {error || 'The user you are looking for does not exist.'}
          </p>
          <button onClick={() => navigate('/blogs')} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg">Go to Blogs</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <ProfileHeader
              profile={profile}
              onEditClick={handleOpenEditModal}
              onFollowToggle={handleFollowToggle}
              isFollowLoading={isFollowLoading}
            />
            <ProfileInfo profile={profile} />
          </div>

          <div className="bg-white rounded-xl shadow-sm">
            <div className="sticky top-[73px] z-10 bg-white rounded-t-xl border-b border-gray-200">
              <NavigationTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                showBookmarks={profile.isOwnProfile}
              />
            </div>
            <div className="p-4 md:p-6">
              {activeTab === 'home' && (
                <PostsList posts={posts} isLoading={isLoadingPosts} />
              )}
              {activeTab === 'bookmarks' && profile.isOwnProfile && (
                <PostsList posts={bookmarks} isLoading={isLoadingBookmarks} />
              )}
            </div>
          </div>
        </div>
      </main>

      {profile && (
        <EditProfileModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} profile={profile} onSave={handleSaveProfile} isSaving={isSavingProfile} saveError={profileSaveError} />
      )}
    </div>
  );
};
