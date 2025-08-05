import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Bookmark, Share2, Check } from "lucide-react";
import Avatar from "./Avatar";
import { Post } from "../types";
import { api } from "../api";

export interface BlogProps {
  post: Post;
  showAuthorInfo?: boolean;
  showEngagementStats?: boolean;
}

export function BlogCard({
  post,
  showAuthorInfo = true,
  showEngagementStats = true,
}: BlogProps): JSX.Element {
  // State for optimistic UI updates
  const [clapCount, setClapCount] = useState(post.clapCount || 0);
  const [isClapped, setIsClapped] = useState(post.isClapped || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [isLoading, setIsLoading] = useState({ clap: false, bookmark: false });
  
  // State for image loading to prevent layout shifts
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const extractFirstTag = () => {
    if (post.tags && post.tags.length > 0) return post.tags[0];
    return "Article";
  };

  const handleEngagementClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const handleClapClick = async () => {
    if (isLoading.clap) return;
    setIsLoading(prev => ({ ...prev, clap: true }));
    setClapCount(prev => (isClapped ? prev - 1 : prev + 1));
    setIsClapped(prev => !prev);
    try {
      const result = await api.toggleClap(post.id);
      setClapCount(result.clapCount);
      setIsClapped(result.isClapped);
    } catch (error) {
      console.error("Error toggling clap:", error);
      setClapCount(prev => (isClapped ? prev + 1 : prev - 1));
      setIsClapped(prev => !prev);
    } finally {
      setIsLoading(prev => ({ ...prev, clap: false }));
    }
  };

  const handleBookmarkClick = async () => {
    if (isLoading.bookmark) return;
    setIsLoading(prev => ({ ...prev, bookmark: true }));
    setIsBookmarked(prev => !prev);
    try {
      const result = await api.toggleBookmark(post.id);
      setIsBookmarked(result.isBookmarked);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      setIsBookmarked(prev => !prev);
    } finally {
      setIsLoading(prev => ({ ...prev, bookmark: false }));
    }
  };

  const handleShareClick = () => {
    const url = `${window.location.origin}/blog/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
    });
  };

  const handleCommentsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/blog/${post.id}#comments`, { state: { scrollToComments: true } });
  };

  return (
    <Link to={`/blog/${post.id}`} className="block group" aria-label={`Read post: ${post.title}`}>
      <article className="py-8 border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-300">
        <div className="flex flex-col-reverse sm:flex-row gap-6 sm:gap-8">
          <div className="flex-1 min-w-0">
            {showAuthorInfo && (
              <div className="flex items-center gap-3 mb-4">
                <Avatar
                  name={post.author.displayName || post.author.username}
                  avatarUrl={post.author.avatar}
                  size={24}
                />
                <div className="text-sm">
                  <span className="font-semibold text-gray-800">{post.author.displayName || post.author.username}</span>
                  <span className="text-gray-500 mx-1.5">·</span>
                  <span className="text-gray-500">{formatDate(post.createdAt)}</span>
                </div>
              </div>
            )}
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2 leading-tight">
              {post.title}
            </h2>
            <p className="text-gray-600 text-base mb-4 line-clamp-2 leading-relaxed">
              {post.snippet || ''}
            </p>
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                  {extractFirstTag()}
                </span>
                <span>{post.readTime} min read</span>
              </div>
              {showEngagementStats && (
                <div className="flex items-center gap-1 sm:gap-2 text-gray-500">
                  <button
                    onClick={(e) => handleEngagementClick(e, handleClapClick)}
                    className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${isClapped ? "text-red-500" : "hover:text-red-500 hover:bg-red-50"} ${isLoading.clap ? "animate-pulse" : ""}`}
                    aria-label={`Clap for this post. Current claps: ${clapCount}`}
                    disabled={isLoading.clap}
                  >
                    <Heart className={`h-5 w-5 ${isClapped ? "fill-current" : ""}`} />
                    <span className="text-xs font-medium">{clapCount > 0 ? clapCount : ""}</span>
                  </button>
                  <button onClick={handleCommentsClick} className="flex items-center gap-1.5 p-2 rounded-full hover:text-green-600 hover:bg-green-50 transition-colors" aria-label={`View responses. Current responses: ${post.responseCount}`}>
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-xs font-medium">{post.responseCount > 0 ? post.responseCount : ""}</span>
                  </button>
                  <button
                    onClick={(e) => handleEngagementClick(e, handleBookmarkClick)}
                    className={`p-2 rounded-full transition-colors ${isBookmarked ? "text-green-600" : "hover:text-green-600 hover:bg-green-50"} ${isLoading.bookmark ? "animate-pulse" : ""}`}
                    aria-label={isBookmarked ? "Remove from bookmarks" : "Save to bookmarks"}
                    disabled={isLoading.bookmark}
                  >
                    <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
                  </button>
                  <button onClick={(e) => handleEngagementClick(e, handleShareClick)} className="p-2 rounded-full hover:text-blue-600 hover:bg-blue-50 transition-colors" aria-label="Share this post">
                    {shareStatus === 'copied' ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="w-full sm:w-32 md:w-48 flex-shrink-0">
            <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setIsImageLoaded(true)}
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
