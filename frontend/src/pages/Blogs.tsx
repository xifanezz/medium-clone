import { useEffect, useState, useMemo } from "react";
import { BlogCard } from "../component/BlogCard";
import { api } from "../api";
import { Post } from "../types";
import { BlogCardSkeleton, TagFilterSkeleton } from "../component/Skeleton";
import { useAuth } from "../context/AuthContext";

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
  const [activeTab, setActiveTab] = useState<'foryou' | 'all'>('all');
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();


  useEffect(() => {
    if (isAuthLoading) return;

    const fetchPosts = async () => {
      try {
        setIsPostsLoading(true);
        setError("");
        
        let result;
        if (activeTab === 'foryou' && currentUser) {
          result = await api.getFeed();
        } else {
          result = await api.getAllPost();
        }

        const formattedPosts: Post[] = result.map((post: any) => ({
          id: post.id,
          title: post.title,
          description: post.description || '',
          snippet: post.snippet || createSnippet(post.description || ''),
          createdAt: post.createdAt,
          readTime: post.readTime ?? 0,
          clapCount: post.clapCount ?? 0,
          responseCount: post.responseCount ?? 0,
          bookmarkCount: post.bookmarkCount ?? 0,
          isClapped: post.isClapped ?? false,
          isBookmarked: post.isBookmarked ?? false,
          tags: post.tags || [],
          imageUrl: post.imageUrl ?? "",
          author: post.author,
        }));

        setPosts(formattedPosts);

        if (activeTab === 'all') {
            const uniqueTags = [...new Set(formattedPosts.flatMap(p => p.tags))];
            setAllTags(uniqueTags.sort());
        }

      } catch (err: any) {
        if (activeTab === 'foryou' && err.message.includes('not found')) {
            setPosts([]);
        } else {
            setError(err.message || "Failed to load posts.");
        }
      } finally {
        setIsPostsLoading(false);
      }
    };

    fetchPosts();
  }, [currentUser, activeTab, isAuthLoading]);

  const filteredPosts = useMemo(() => {
    if (activeTab === 'all' && selectedTags.length > 0) {
      return posts.filter(post => selectedTags.every(tag => post.tags.includes(tag)));
    }
    return posts;
  }, [posts, selectedTags, activeTab]);

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (isAuthLoading) {
    return (
      <div className="flex-grow w-full max-w-4xl p-4 mx-auto sm:p-6 md:p-8">
        <div className="h-10 w-48 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
        <TagFilterSkeleton />
        <div className="mt-4">
          {[...Array(5)].map((_, i) => <BlogCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-4xl p-4 mx-auto sm:p-6 md:p-8">
      <div className="flex items-center border-b border-gray-200 mb-4">
        {currentUser && (
            <button
                onClick={() => setActiveTab('foryou')}
                className={`py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'foryou' ? 'border-b-2 border-gray-800 text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Following
            </button>
        )}
        <button
            onClick={() => setActiveTab('all')}
            className={`py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'all' ? 'border-b-2 border-gray-800 text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
        >
            Explore
        </button>
      </div>

      {isPostsLoading ? (
        <div className="mt-4">
            {[...Array(5)].map((_, i) => <BlogCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-20"><p className="text-red-600">{error}</p></div>
      ) : (
        <>
            {activeTab === 'all' && (
                <div className="py-4">
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
            )}
            <div className="mt-4">
            {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} showAuthorInfo={true} />
                ))
            ) : (
                <div className="text-center py-16">
                <h3 className="text-lg font-medium text-gray-900">
                    {activeTab === 'foryou' ? "Your feed is empty" : "No posts found"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    {activeTab === 'foryou' ? "Follow some authors to see their posts here." : "Try adjusting your selected tags."}
                </p>
                </div>
            )}
            </div>
        </>
      )}
    </div>
  );
};
