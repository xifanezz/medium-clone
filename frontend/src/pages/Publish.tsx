import { useNavigate } from "react-router-dom";
import { Editor } from '@tiptap/core';
import { useState, lazy, Suspense, useRef, useEffect, useCallback } from 'react';
import { api } from "../api";
import { usePageAction } from "../context/PageActionContext";

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

  // Get the setSaveAction function from context
  const { setSaveAction } = usePageAction();

  const handleSave = useCallback(async () => {
    const editor = editorRef.current;
    const currentTitle = titleRef.current?.value || "";

    if (!editor || !currentTitle.trim() || editor.getHTML() === "<p></p>") {
      const validationError = "Title and description cannot be empty.";
      setError(validationError);
      throw new Error(validationError); // Throw error to stop the context's saving state
    }

    try {
      setError("");
      const result = await api.createPost(currentTitle, editor.getHTML());
      navigate(`/blog/${result.id}`);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to publish post. Please try again.";
      setError(errorMessage);
      throw err; // Re-throw the error so the context knows the save failed
    }
  }, [navigate]);

  // This effect registers handleSave function with the global context
  // so the header button can call it.
  useEffect(() => {
    setSaveAction(handleSave);
    // On cleanup, remove the action to prevent it from being called on other pages
    return () => setSaveAction(null);
  }, [handleSave, setSaveAction]);

  return (
    // The empty div for the header is no longer needed
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
