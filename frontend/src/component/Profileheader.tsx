import { UserProfile } from "../types";
import { UserAvatar } from "./Avatar"; // Using our new, simplified Avatar
import { Edit, UserPlus, UserCheck } from 'lucide-react';
import React from "react";

export interface ProfileHeaderProps {
  profile: UserProfile;
  /** Callback function for when the edit button is clicked. */
  onEditClick: () => void;
  /** Callback function to toggle the follow state. */
  onFollowToggle: () => void;
  /** Loading state for the follow button. */
  isFollowLoading?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onEditClick,
  onFollowToggle,
  isFollowLoading = false,
}) => {
  return (
    <div className="relative -mt-16">
      {/* Cover Image */}
      <div className="h-48 sm:h-64 bg-gray-200 rounded-t-xl overflow-hidden">
        {profile.coverImage ? (
          <img
            src={profile.coverImage}
            alt={`${profile.displayName}'s cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"></div>
        )}
      </div>

      {/* Main Header Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-end sm:space-x-5">
          {/* Avatar that overlaps the cover image */}
          <div className="flex-shrink-0 -mt-16 sm:-mt-20">
            <UserAvatar
              user={profile}
              size={140}
              shape="circle"
              className="border-4 border-white shadow-lg"
            />
          </div>

          {/* User Name and Action Buttons */}
          <div className="mt-4 sm:mt-0 flex-1 flex flex-col sm:flex-row items-center justify-between w-full pb-4 sm:pb-6">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {profile.displayName}
              </h1>
              <p className="text-base text-gray-500 mt-1">@{profile.username}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              {profile.isOwnProfile ? (
                <button
                  onClick={onEditClick}
                  className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-800 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={onFollowToggle}
                  disabled={isFollowLoading}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 w-28 justify-center shadow-sm ${profile.isFollowing
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
                      : 'bg-green-600 text-white hover:bg-green-700'
                    } ${isFollowLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isFollowLoading ? (
                    <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : profile.isFollowing ? (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </button>
              )}
              {/* <button className="p-2.5 text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 rounded-full transition-colors shadow-sm">
                <Settings className="h-5 w-5" />
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
