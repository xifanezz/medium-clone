import { useEffect, useState } from "react";
import { BlogCard } from "../component/BlogCard";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { Post } from "../types";
import { BlogCardSkeleton, TagFilterSkeleton } from "../component/Skeleton";
import { useAuth } from "../context/AuthContext";

export const Blogs = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // State for tag filtering
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  const navigate = useNavigate();
  const { isLoading: isAuthLoading } = useAuth();

  // Effect to fetch all posts and extract unique tags
  useEffect(() => {
    // wait for the auth check to complete before fetching posts.
    // This ensures we can pass the correct auth headers if the user is logged in.
    if (isAuthLoading) {
      return;
    }

    const fetchPosts = async () => {
      try {
        setIsPostsLoading(true);
        const result = await api.getAllPost();


        const formattedPosts: Post[] = result.map((post: any) => ({
          id: post.id,
          title: post.title,
          description: post.description,
          createdAt: post.createdAt,
          readTime: post.readTime ?? 0,
          clapCount: post._count.claps ?? 0,
          responseCount: post._count.comments ?? 0,
          bookmarkCount: post._count.bookmarks ?? 0,
          isClapped: post.isClapped ?? false,
          isBookmarked: post.isBookmarked ?? false,
          tags: post.tags.map((pt: any) => pt.tag.name),
          imageUrl: post.imageUrl ?? "",
          author: {
            username: post.author?.username || "user",
            displayName: post.author?.displayName || "user",
            avatar: post.author?.avatar || "",
            bio: post.author?.bio || "",
          },
        }));

        setPosts(formattedPosts);

        const uniqueTags = [...new Set(formattedPosts.flatMap(post => post.tags))];
        setAllTags(uniqueTags.sort());

      } catch (err: any) {
        setError(err.message || "Failed to load posts. Please try again.");
      } finally {
        setIsPostsLoading(false);
      }
    };

    fetchPosts();
  }, [isAuthLoading, navigate]); // Re-fetch if the auth state changes

  // Effect to filter posts whenever the selection changes
  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(
        posts.filter(post =>
          selectedTags.every(tag => post.tags.includes(tag))
        )
      );
    }
  }, [selectedTags, posts]);

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Show skeleton if either auth is loading or posts are loading
  if (isAuthLoading || isPostsLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">

        <div className="flex-grow w-full max-w-4xl p-4 mx-auto sm:p-6 md:p-8">
          <TagFilterSkeleton />
          <div className="mt-4">
            {[...Array(5)].map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">

      <div className="flex-grow w-full max-w-4xl p-4 mx-auto sm:p-6 md:p-8">
        <div className="py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  selectedTags.includes(tag)
                    ? 'bg-green-600 text-white focus-visible:ring-green-500 px-4 py-1.5 shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-400 px-6 py-2'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                showEngagementStats={true}
              />
            ))
          ) : (
            <div className="text-center py-16">
              <h3 className="text-lg font-medium text-gray-900">No posts found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your selected tags to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
