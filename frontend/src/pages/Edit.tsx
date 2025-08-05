import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, lazy, Suspense, useRef, useCallback } from "react";
import { Editor } from '@tiptap/core';
import { Post } from "../types";
import { api } from "../api";
import { EditPageSkeleton } from "../component/Skeleton";
import { useAuth } from "../context/AuthContext";
import { usePageAction } from "../context/PageActionContext";
const Tiptap = lazy(() => import("../component/Tiptap"));

const EditorPlaceholder = () => (
  <div className="w-full min-h-[400px] pt-4">
    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none">
      <p className="text-gray-400">Loading Editor...</p>
    </div>
  </div>
);

export function Edit(): JSX.Element {
  const [blog, setBlog] = useState<Post | null>(null);
  const [isPostLoading, setIsPostLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [initialTitle, setInitialTitle] = useState("");

  const editorRef = useRef<Editor | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Get the setter from context
  const { setSaveAction } = usePageAction();

  useEffect(() => {
    if (isAuthLoading || !id) return;
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    const fetchBlogForEdit = async () => {
      try {
        setIsPostLoading(true);
        const result = await api.getPostById(Number(id));
        //#TODO if the database trigger changes to form another type of default username from email. Changes are needed here too
        if (result.author.username !== (currentUser?.user_metadata.username || currentUser?.email?.split("@")[0])) {
          setError("You are not authorized to edit this post.");
          setBlog(null);
        } else {
          setBlog(result);
          setInitialTitle(result.title);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load blog post.");
      } finally {
        setIsPostLoading(false);
      }
    };
    fetchBlogForEdit();
  }, [id, currentUser, isAuthLoading, navigate]);

  const handleSave = useCallback(async () => {
    const editor = editorRef.current;
    const currentTitle = titleRef.current?.value || "";

    if (!editor || !blog) {
      const validationError = "Editor or blog data is not available.";
      setError(validationError);
      throw new Error(validationError);
    }
    if (!currentTitle.trim() || editor.getHTML() === "<p></p>") {
      const validationError = "Title and description cannot be empty.";
      setError(validationError);
      throw new Error(validationError);
    }
    try {
      setError("");
      const result = await api.editPostById(blog.id, currentTitle, editor.getHTML());
      navigate(`/blog/${result.id}`);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update blog post.";
      setError(errorMessage);
      throw err;
    }
  }, [blog, navigate]); 

  // Effect to register the save action with the context
  useEffect(() => {
    // Only set the save action if a blog is loaded (and editable)
    if (blog) {
      setSaveAction(handleSave);
    }
    // On cleanup, we remove the action
    return () => setSaveAction(null);
  }, [blog, handleSave, setSaveAction]);

  if (isAuthLoading || isPostLoading) {
    return <EditPageSkeleton />;
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Cannot Edit Post</h2>
          <p className="text-gray-500 text-sm">{error || "The post could not be found or you lack permission."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 w-full">
          <form>
            <textarea
              ref={titleRef}
              key={initialTitle}
              defaultValue={initialTitle}
              placeholder="Title"
              className="w-full font-serif text-3xl sm:text-4xl lg:text-5xl mt-4 sm:mt-6 lg:mt-8 mb-2 sm:mb-4 border-b border-gray-300 focus:outline-none focus:border-gray-500 resize-none bg-transparent"
              rows={2}
            />
            <div className="w-full min-h-[400px] max-h-[600px] overflow-auto">
              <Suspense fallback={<EditorPlaceholder />}>
                <Tiptap
                  setEditor={(editorInstance) => { editorRef.current = editorInstance; }}
                  initialContent={blog.description || ""}
                />
              </Suspense>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
