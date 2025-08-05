import { useNavigate } from "react-router-dom";
import { Editor } from '@tiptap/core';
import { useState, lazy, Suspense, useRef, useEffect, useCallback, ChangeEvent } from 'react';
import { api } from "../api";
import { usePageAction } from "../context/PageActionContext";
import { useAuth } from "../context/AuthContext";
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

export function Publish(): JSX.Element {
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const editorRef = useRef<Editor | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { user: currentUser } = useAuth();
  const { setSaveAction } = usePageAction();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSave = useCallback(async () => {
    const editor = editorRef.current;
    const currentTitle = titleRef.current?.value || "";

    if (!editor || !currentTitle.trim() || editor.getHTML() === "<p></p>") {
      const validationError = "Title and description cannot be empty.";
      setError(validationError);
      throw new Error(validationError);
    }

    let imageUrl: string | undefined = undefined;

    if (imageFile && currentUser) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        const { data, error: uploadError } = await supabase.storage
            .from('post-images')
            .upload(filePath, imageFile);

        if (uploadError) {
            setError("Failed to upload featured image. Please try again.");
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('post-images')
            .getPublicUrl(data.path);
        imageUrl = publicUrl;
    }

    try {
      setError("");
      const result = await api.createPost(currentTitle, editor.getHTML(), imageUrl);
      navigate(`/blog/${result.id}`);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to publish post.";
      setError(errorMessage);
      throw err;
    }
  }, [navigate, imageFile, currentUser]);

  useEffect(() => {
    setSaveAction(handleSave);
    return () => setSaveAction(null);
  }, [handleSave, setSaveAction]);

  return (
    <div className="content-area pt-10 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto w-full">
      {error && (
        <div className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50" role="alert">
          <svg className="flex-shrink-0 inline w-4 h-4 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <span className="sr-only">Error</span>
          <div><span className="font-medium">Error:</span> {error}</div>
        </div>
      )}
      
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

      <textarea
        ref={titleRef}
        defaultValue=""
        placeholder="Title"
        className="w-full text-3xl sm:text-4xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none resize-none mb-6"
        rows={2}
        onChange={() => setError("")}
      />
      <Suspense fallback={<EditorPlaceholder />}>
        <Tiptap setEditor={(editorInstance) => { editorRef.current = editorInstance; }} />
      </Suspense>
    </div>
  );
}
