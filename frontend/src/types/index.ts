export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  coverImage?: string;
  location?: string;
  website?: string;
  joinedDate: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

export interface User {
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
}

export interface Tag {
  id: number;
  name: string;
  description: string;
}

export interface Post {
  id: number;
  title: string;
  description?: string;
  snippet?: string;
  createdAt: string;
  publishedAt?: string;
  readTime: number;
  clapCount: number;
  responseCount: number;
  bookmarkCount: number;
  isClapped: boolean;
  isBookmarked: boolean;
  tags: string[];
  imageUrl?: string;
  author: User;
}

export interface PostComment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId?: number;
  user: User;
  repliesCount: number;
  replies?: PostComment[];
}

export interface CommentResponse {
  data: PostComment[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface CreateCommentPayload {
  content: string;
  parentId?: number;
}

export interface UpdateCommentPayload {
  content: string;
}

export interface UpdateUserProfilePayload {
  displayName?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  username?: string;
}
