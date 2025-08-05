import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, lazy, Suspense, useRef, useCallback, ChangeEvent } from "react";
import { Editor } from '@tiptap/core';
import { Post } from "../types";
import { api } from "../api";
import { EditPageSkeleton } from "../component/Skeleton";
import { useAuth } from "../context/AuthContext";
import { usePageAction } from "../context/PageActionContext";
import { supabase } from "../lib/supabaseClient";
import { ImageUp, X } from "lucide-react";

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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [imageRemoved, setImageRemoved] = useState(false);

  const editorRef = useRef<Editor | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
          // Set initial image preview from existing blog data
          setImagePreview(result.imageUrl || null);
          setImageRemoved(false);
          setImageFile(null);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load blog post.");
      } finally {
        setIsPostLoading(false);
      }
    };
    fetchBlogForEdit();
  }, [id, currentUser, isAuthLoading, navigate]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageRemoved(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(true);
  };

  const handleSave = useCallback(async () => {
    const editor = editorRef.current;
    const currentTitle = titleRef.current?.value || "";

    if (!editor || !blog) {
      throw new Error("Editor or blog data is not available.");
    }
    if (!currentTitle.trim() || editor.getHTML() === "<p></p>") {
      throw new Error("Title and description cannot be empty.");
    }

    let imageUrl: string | null | undefined = blog.imageUrl;

    // Upload a new image if one was selected
    if (imageFile && currentUser) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;
        const { data, error: uploadError } = await supabase.storage.from('post-images').upload(filePath, imageFile);

        if (uploadError) throw new Error("Failed to upload featured image.");

        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(data.path);
        imageUrl = publicUrl;
    } else if (imageRemoved) {
        imageUrl = null; // Set to null if user removed the image
    }

    try {
      setError("");
      // Pass the potentially updated imageUrl to the API
      const result = await api.editPostById(blog.id, currentTitle, editor.getHTML(), imageUrl ||'');
      navigate(`/blog/${result.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to update blog post.");
      throw err;
    }
  }, [blog, navigate, imageFile, imageRemoved, currentUser]);

  useEffect(() => {
    if (blog) {
      setSaveAction(handleSave);
    }
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
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
        {/* --- NEW UI for Image Upload --- */}
        <div className="mb-6">
            {imagePreview ? (
            <div className="relative group">
                <img src={imagePreview} alt="Featured post preview" className="w-full h-64 object-cover rounded-lg" />
                <button onClick={removeImage} className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors">
                <X size={16} />
                </button>
            </div>
            ) : (
            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ImageUp size={32} className="text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Add a featured image</span>
                <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} />
            </label>
            )}
        </div>

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
  );
}