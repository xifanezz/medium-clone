import { UserProfile } from "../types";
import { Users, MapPin, Link as LinkIcon, Calendar, FileText } from 'lucide-react';
import React from "react";

// helper component to keep stats items consistent
const StatItem: React.FC<{ icon: React.ReactNode; children: React.ReactNode; href?: string }> = ({ icon, children, href }) => {
  const content = (
    <span className="flex items-center gap-2 text-slate-500 hover:text-green-600 transition-colors duration-200">
      {icon}
      <span className="font-medium">{children}</span>
    </span>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="inline-block">
        {content}
      </a>
    );
  }

  return content;
};


export const ProfileInfo: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const formatJoinDate = (dateString: string) => {
    if (!dateString) return ''; // Guard against undefined date
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  // Helper function to format large numbers
  const formatCount = (count: number | null | undefined): string => {
    const validCount = count ?? 0;

    if (validCount >= 1000000) return `${(validCount / 1000000).toFixed(1)}M`;
    if (validCount >= 1000) return `${(validCount / 1000).toFixed(1)}K`;
    return validCount.toLocaleString();
  };

  return (
    <div className="py-6 border-b border-gray-100">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* User Bio */}
        {profile.bio && (
          <p className="text-slate-700 text-base leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* User Stats and Information */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <StatItem icon={<Users size={16} />}>
            {formatCount(profile.followersCount)} Followers
          </StatItem>
          
          <span className="text-slate-500 font-medium hover:text-green-600 transition-colors duration-200">
            {formatCount(profile.followingCount)} Following
          </span>

          <StatItem icon={<FileText size={15} />}>
            {formatCount(profile.postsCount)} Posts
          </StatItem>
          
          {profile.location && (
            <StatItem icon={<MapPin size={15} />}>
              {profile.location}
            </StatItem>
          )}

          <StatItem icon={<Calendar size={15} />}>
            Joined {formatJoinDate(profile.joinedDate)}
          </StatItem>
          
          {profile.website && (
            <StatItem icon={<LinkIcon size={15} />} href={profile.website}>
              {profile.website.replace(/^https?:\/\//, '')}
            </StatItem>
          )}
        </div>
      </div>
    </div>
  );
};
