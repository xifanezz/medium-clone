import React, { useState, useEffect, useRef, memo } from 'react';
import { UserAvatar } from './Avatar';
import { User } from '../types';
import { CommentItem } from './CommentItem';
import { CommentSectionSkeleton } from './Skeleton';
import { useComments } from '../hooks/useComments';

export interface CommentSectionProps {
  postId: number;
  currentUser: User | null
}

// Created a tiny, memoized component specifically for the character count.
// It manages its own state, so only it will re-render on change.
const CharacterCounter = memo(({ maxLength, onCountChange }: { maxLength: number, onCountChange: (fn: (count: number) => void) => void }) => {
  const [count, setCount] = useState(0);

  // This effect registers the `setCount` function with the parent component via a ref.
  useEffect(() => {
    onCountChange(setCount);
  }, [onCountChange]);

  return (
    <div className="text-sm text-slate-500">{count}/{maxLength}</div>
  );
});


export const CommentSection: React.FC<CommentSectionProps> = ({ postId, currentUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const newCommentRef = useRef<HTMLTextAreaElement>(null);

  // Created a ref to hold the function that updates the character counter's state.
  const updateCharCountRef = useRef<((count: number) => void) | null>(null);

  const {
    comments,
    isLoading,
    error,
    editingCommentId,
    editContent,
    setEditContent,
    expandedReplies,
    hasMore,
    isLoadingMore,
    replyingToId,
    fetchComments,
    handleLoadMore,
    handleSubmitComment,
    handleReply,
    handleEditComment,
    handleDeleteComment,
    toggleReplies,
    startEdit,
    cancelEdit,
    startReply,
    cancelReply,
  } = useComments(postId, currentUser);

  useEffect(() => {
    if (isExpanded) {
      fetchComments(1, true);
    }
  }, [isExpanded, fetchComments]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentRef.current) {
      handleSubmitComment(newCommentRef.current.value);
      newCommentRef.current.value = '';
      // Reset the counter after submit
      updateCharCountRef.current?.(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 mt-16">
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/40 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200/40">
          <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center justify-between w-full text-left group">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Comments</h3>
            </div>
            <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}><svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
          </button>
        </div>

        {/* Expandable Content */}
        <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="p-6 space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

            {/* Comment Input Form */}
            {currentUser && (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="flex items-start gap-4">
                  <UserAvatar user={currentUser} size={40} />
                  <div className="flex-1">
                    <textarea
                      ref={newCommentRef}

                      // The onChange handler calls the function held in the ref,
                      // which only updates the state of the tiny CharacterCounter component.
                      onChange={(e) => updateCharCountRef.current?.(e.target.value.length)}
                      placeholder="Add a comment..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white/50 backdrop-blur-sm"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <CharacterCounter
                        maxLength={500}
                        onCountChange={(fn) => (updateCharCountRef.current = fn)}
                      />
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => { if (newCommentRef.current) newCommentRef.current.value = ''; updateCharCountRef.current?.(0); }} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Comment</button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {isLoading && <div className="text-center py-8"><CommentSectionSkeleton /></div>}

            {!isLoading && (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id}>
                    <CommentItem
                      comment={comment}
                      depth={0}
                      currentUser={currentUser}
                      onEdit={startEdit}
                      onDelete={handleDeleteComment}
                      onReply={handleReply}
                      onToggleReplies={toggleReplies}
                      isEditing={editingCommentId === comment.id}
                      editContent={editContent}
                      setEditContent={setEditContent}
                      onSaveEdit={handleEditComment}
                      onCancelEdit={cancelEdit}
                      replyingToId={replyingToId}
                      onStartReply={startReply}
                      onCancelReply={cancelReply}
                    />
                    {expandedReplies.includes(comment.id) && (
                      <div className="pl-10 mt-4 space-y-4 border-l-2 border-slate-200 ml-5">
                        {comment.replies?.map((reply) => (
                          <CommentItem
                            key={reply.id}
                            comment={reply}
                            depth={1}
                            currentUser={currentUser}
                            onEdit={startEdit}
                            onDelete={handleDeleteComment}
                            onReply={handleReply}
                            onToggleReplies={toggleReplies}
                            isEditing={editingCommentId === reply.id}
                            editContent={editContent}
                            setEditContent={setEditContent}
                            onSaveEdit={handleEditComment}
                            onCancelEdit={cancelEdit}
                            replyingToId={replyingToId}
                            onStartReply={startReply}
                            onCancelReply={cancelReply}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {hasMore && !isLoading && (
              <div className="text-center pt-4">
                <button onClick={handleLoadMore} disabled={isLoadingMore} className="px-6 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50">
                  {isLoadingMore ? 'Loading...' : 'Load More Comments'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
