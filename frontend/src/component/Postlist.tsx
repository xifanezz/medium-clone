import { Post } from "../types";
import { BlogCard } from "./BlogCard";
import { PostsListSkeleton } from "./Skeleton";
import React from "react";

interface PostsListProps {
  posts: Post[];
  isLoading?: boolean;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    message: string;
  };
}

const DefaultEmptyIcon = () => (
    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

export const PostsList: React.FC<PostsListProps> = ({ 
  posts, 
  isLoading,
  emptyState = {
    icon: <DefaultEmptyIcon />,
    title: "No posts yet",
    message: "This user hasn't published any posts."
  }
}) => {
  if (isLoading) {
    return <PostsListSkeleton />;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-gray-50/50 rounded-xl">
          {emptyState.icon}
          <h3 className="mt-4 text-lg font-semibold text-gray-900">{emptyState.title}</h3>
          <p className="mt-1 text-base text-gray-500">{emptyState.message}</p>
      </div>
    );
  }

  return (
    // --- UI IMPROVEMENT ---
    // Replaced `divide-y` with `space-y-4`. This creates a more modern,
    // card-based layout with clear visual gaps between each post.
    // The BlogCard component itself is responsible for its own bottom border.
    <div className="space-y-4">
      {posts.map((post) => (
        <BlogCard
          key={post.id}
          post={post}
          // On the profile page, the author is always the same, so we hide it on the card
          showAuthorInfo={false} 
        />
      ))}
    </div>
  );
};
