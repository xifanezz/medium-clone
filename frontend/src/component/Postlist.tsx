import { Post } from "../types";
import { BlogCard } from "./BlogCard";
import { PostsListSkeleton } from "./Skeleton";

export const PostsList: React.FC<{
  posts: Post[];
  isLoading?: boolean;
}> = ({ posts, isLoading }) => {
  if (isLoading) {
    return <PostsListSkeleton />;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No posts yet</h3>
          <p className="mt-1 text-sm text-gray-500">This user hasn't published any posts.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {posts.map((post) => (
        <BlogCard
          key={post.id}
          post={post}
          showAuthorInfo={false}
          showEngagementStats={true}
        />
      ))}
    </div>
  );
};