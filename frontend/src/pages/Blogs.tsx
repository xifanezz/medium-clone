import { useEffect, useState } from "react";
import { BlogCard } from "../component/BlogCard";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { Post } from "../types";
import { BlogCardSkeleton, TagFilterSkeleton } from "../component/Skeleton";
import { useAuth } from "../context/AuthContext";

// Helper function for backward compatibility
const createSnippet = (htmlContent: string, length = 150) => {
  if (!htmlContent) return '';
  const plainText = htmlContent.replace(/<[^>]+>/g, '');
  if (plainText.length <= length) return plainText;
  return plainText.substring(0, length) + '...';
};

export const Blogs = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  const navigate = useNavigate();
  const { isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthLoading) return;

    const fetchPosts = async () => {
      try {
        setIsPostsLoading(true);
        const result = await api.getAllPost();

        const formattedPosts: Post[] = result.map((post: any) => ({
          id: post.id,
          title: post.title,
          description: post.description || '',
          // Use snippet from API if available, otherwise create it for backward compatibility
          snippet: post.snippet || createSnippet(post.description || ''),
          createdAt: post.createdAt,
          readTime: post.readTime ?? 0,
          clapCount: post._count?.claps ?? 0,
          responseCount: post._count?.comments ?? 0,
          bookmarkCount: post._count?.bookmarks ?? 0,
          isClapped: post.isClapped ?? false,
          isBookmarked: post.isBookmarked ?? false,
          tags: post.tags || [],
          imageUrl: post.imageUrl ?? "",
          author: {
            username: post.author?.username || "user",
            displayName: post.author?.displayName || "user",
            avatar: post.author?.avatar || "",
            bio: post.author?.bio || "",
          },
        }));

        setPosts(formattedPosts);
        const uniqueTags = [...new Set(formattedPosts.flatMap(p => p.tags))];
        setAllTags(uniqueTags.sort());

      } catch (err: any) {
        setError(err.message || "Failed to load posts.");
      } finally {
        setIsPostsLoading(false);
      }
    };

    fetchPosts();
  }, [isAuthLoading, navigate]);

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
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (isAuthLoading || isPostsLoading) {
    return (
      <div className="flex-grow w-full max-w-4xl p-4 mx-auto sm:p-6 md:p-8">
        <TagFilterSkeleton />
        <div className="mt-4">
          {[...Array(5)].map((_, i) => <BlogCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-4xl p-4 mx-auto sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Feed</h1>
      <div className="py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                selectedTags.includes(tag)
                  ? 'bg-gray-800 text-white focus-visible:ring-gray-700 px-4 py-1.5'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-400 px-4 py-1.5'
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
            <BlogCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-900">No posts found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your selected tags.</p>
          </div>
        )}
      </div>
    </div>
  );
};
