import { useNavigate, useParams } from "react-router-dom";
import { UserAvatar } from "../component/Avatar";
import { useEffect, useState } from "react";
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import { BlogPageSkeleton } from "../component/Skeleton";
import { CommentSection } from "../component/CommentSection";
import { Post } from "../types";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";


export const Blog = () => {
  const [blog, setBlog] = useState<Post | null>(null);
  const [isBlogLoading, setIsBlogLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    // Wait for the auth check to complete before fetching blog data
    if (isAuthLoading) {
      return;
    }

    const fetchBlogData = async () => {
      if (!id) {
        setError("Invalid blog ID.");
        setIsBlogLoading(false);
        return;
      }

      try {
        setIsBlogLoading(true);
        const blogResult = await api.getPostById(Number(id));
        setBlog(blogResult);
      } catch (err: any) {
        setError(err.message || "Failed to load blog post. Please try again.");
      } finally {
        setIsBlogLoading(false);
      }
    };

    fetchBlogData();
  }, [id, isAuthLoading]); // Depends on auth loading state

  const mappedUserForHeader = currentUser ? {
    username: currentUser?.user_metadata.username || currentUser?.email?.split("@")[0],//#TODO if the database trigger changes to form another type of default username from email. Changes are needed here too
    displayName: currentUser.user_metadata.full_name || currentUser.user_metadata.name,
    avatar: currentUser.user_metadata.avatar_url,
  } : null;

  // Show skeleton if either auth is loading or the blog post is loading
  if (isAuthLoading || isBlogLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-slate-50/50">

        <BlogPageSkeleton />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-slate-50/30 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 text-center max-w-md">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Something went wrong</h3>
          <p className="text-slate-600 text-sm">{error || "Blog post not found"}</p>
        </div>
      </div>
    );
  }


  const cleanHtml = DOMPurify.sanitize(blog.description || "");
  const description = parse(cleanHtml);
  const name = blog.author.displayName || blog.author.username || "?";
  const bio = blog.author.bio || "";
  const date = new Date(blog.createdAt);
  const monthString = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-slate-50/50">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 pt-12 pb-8">
        <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            Published {monthString} {day}, {year}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-slate-900 mb-8 ...">{blog.title}</h1>
        </div>
      </div>
      {blog.imageUrl && (
        <div className="max-w-5xl mx-auto px-6 sm:px-8 mb-12">
          <img src={blog.imageUrl} alt={blog.title} className="w-full h-auto max-h-[500px] object-cover rounded-xl shadow-lg" />
        </div>
      )}

      {/* Content Section */}
      <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-20">
      <article className="bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/40 shadow-sm p-8 sm:p-12">
          <div className="prose prose-lg prose-slate max-w-none">
            <div className="description text-slate-700 leading-relaxed">
              {description}
            </div>
          </div>
        </article>
        <div className="mt-16 pt-12 border-t border-slate-200/60">
          <div className="flex items-start gap-6">
            <button
              onClick={() => navigate(`/profile/${blog.author.username}`)}
              className="focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full transition duration-200 hover:scale-105"
              aria-label={`View profile of ${name}`}
            >
              <UserAvatar user={blog.author} size={80} />
            </button>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">About {name}</h3>
              <p className="text-slate-600 leading-relaxed">
                {bio || "This author hasn't written a bio yet."}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <CommentSection postId={Number(id)} currentUser={mappedUserForHeader} />
    </div>
  );
};