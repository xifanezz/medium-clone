// components/Avatar.tsx

import { useState, useEffect } from 'react';
import { avatarCache, fetchAndCacheAvatar } from '../lib/lruAvatarCache';
import { User } from '../types';

export interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
  shape?: 'circle' | 'square' | 'rounded';
}

export default function Avatar({
  name,
  avatarUrl,
  size = 40,
  className = '',
  shape = 'circle',
}: AvatarProps): JSX.Element {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setImageSrc(null);

    if (!avatarUrl) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadImage = async () => {
      // 1. Check the LRU cache first. The .get() method is very fast.
      const cachedImage = avatarCache.get(avatarUrl);
      if (cachedImage) {
        if (isMounted) {
          setImageSrc(cachedImage);
          setIsLoading(false);
        }
        return;
      }

      // 2. If not in cache, fetch it. The fetch function will handle caching it.
      try {
        const base64Image = await fetchAndCacheAvatar(avatarUrl);
        if (isMounted) {
          setImageSrc(base64Image);
        }
      } catch (error) {
        console.error("Avatar load error:", error);
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [avatarUrl]);

  // --- Helper functions for generating the fallback UI ---

  const getInitials = (name: string): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBackgroundColor = (name: string): string => {
    if (!name) return '#6b7280';
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
      '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
      '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getFontSize = (size: number): string => {
    if (size <= 24) return 'text-xs';
    if (size <= 40) return 'text-sm';
    if (size <= 64) return 'text-lg';
    return 'text-xl';
  };

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const showImage = !!imageSrc && !hasError && !isLoading;
  const showFallback = !showImage && !isLoading;

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden bg-gray-100 ${shapeClasses[shape]} ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Avatar for ${name}`}
    >
      {isLoading && <div className="w-full h-full bg-gray-200 animate-pulse"></div>}
      {showImage && (
        <img
          src={imageSrc!}
          alt={`${name}'s avatar`}
          className="w-full h-full object-cover"
        />
      )}
      {showFallback && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: getBackgroundColor(name) }}
        >
          <span className={`font-semibold text-white select-none ${getFontSize(size)}`}>
            {getInitials(name)}
          </span>
        </div>
      )}
    </div>
  );
}

export function UserAvatar({
  user,
  size,
  ...props
}: {
  user: User;
  size?: number;
} & Omit<AvatarProps, 'name' | 'avatarUrl'>) {
  const displayName = user.displayName || user.username || 'User';

  return (
    <Avatar
      name={displayName}
      avatarUrl={user.avatar}
      size={size}
      {...props}
    />
  );
}
