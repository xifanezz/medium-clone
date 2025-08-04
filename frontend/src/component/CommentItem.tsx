import React, { useState } from 'react';
import { UserAvatar } from './Avatar';
import { PostComment, User } from '../types';

interface CommentItemProps {
    comment: PostComment;
    depth: number;
    currentUser: User | null;
    onEdit: (comment: PostComment) => void;
    onDelete: (commentId: number) => void;
    onReply: (parentId: number, content: string) => Promise<void>;
    onToggleReplies: (commentId: number) => void;
    isEditing: boolean;
    editContent: string;
    setEditContent: (content: string) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    replyingToId: number | null;
    onStartReply: (commentId: number) => void;
    onCancelReply: () => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    depth,
    currentUser,
    onEdit,
    onDelete,
    onReply,
    onToggleReplies,
    isEditing,
    editContent,
    setEditContent,
    onSaveEdit,
    onCancelEdit,
    replyingToId,
    onStartReply,
    onCancelReply,
}) => {
    // State for the reply input is co-located here
    const [replyContent, setReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    const isReplying = replyingToId === comment.id;

    const handleSubmitReply = async () => {
        if (!replyContent.trim()) return;

        setIsSubmittingReply(true);
        try {
            await onReply(comment.id, replyContent);
            setReplyContent(''); // Clear input on success
            onCancelReply(); // Close the reply form
        } catch (error) {
            console.error("Failed to submit reply:", error);
            // #TODO Optionally, show an error to the user 
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const formatTimeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return 'long ago';
    };

    return (
        <div className="flex items-start gap-4">
            <UserAvatar user={comment.user} size={40} />
            <div className="flex-1">
                <div className="bg-slate-50/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        {/* User Info and Timestamp */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-900 text-sm">{comment.user.displayName}</span>
                            <span className="text-slate-500 text-xs">@{comment.user.username}</span>
                            <span className="text-slate-500 text-xs">
                                {formatTimeAgo(comment.createdAt)}
                                {comment.updatedAt !== comment.createdAt && <span className="ml-1">(edited)</span>}
                            </span>
                        </div>

                        {/* Edit/Delete Buttons */}
                        {currentUser?.username === comment.user.username && !isEditing && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => onEdit(comment)} className="text-slate-500 hover:text-blue-600 text-xs font-medium">Edit</button>
                                <button onClick={() => onDelete(comment.id)} className="text-slate-500 hover:text-red-600 text-xs font-medium">Delete</button>
                            </div>
                        )}
                    </div>

                    {/* Conditional rendering for Editing UI vs. Content */}
                    {isEditing ? (
                        <div className="space-y-2">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                rows={3}
                            />
                            <div className="flex items-center gap-2 justify-end">
                                <button onClick={onCancelEdit} className="px-3 py-1 text-slate-600 text-xs hover:text-slate-800">Cancel</button>
                                <button onClick={onSaveEdit} className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">Save</button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    )}
                </div>

                {/* Action buttons below the comment */}
                <div className="mt-2 ml-4 flex items-center gap-4">
                    {comment.repliesCount > 0 && (
                        <button onClick={() => onToggleReplies(comment.id)} className="text-slate-500 text-xs hover:text-slate-700 font-medium">
                            View {comment.repliesCount} {comment.repliesCount === 1 ? 'reply' : 'replies'}
                        </button>
                    )}

                    {currentUser && depth === 0 && (
                        <button
                            onClick={() => onStartReply(comment.id)}
                            className="text-blue-600 text-xs font-medium hover:text-blue-700"
                        >
                            Reply
                        </button>
                    )}
                </div>

                {/* Conditional rendering for the Reply Form */}
                {isReplying && (
                    <div className="mt-4 flex items-start gap-3">
                        <UserAvatar user={currentUser!} size={32} />
                        <div className="flex-1">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={`Replying to ${comment.user.displayName}...`}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                rows={2}
                                autoFocus
                            />
                            <div className="flex items-center gap-2 mt-2 justify-end">
                                <button onClick={onCancelReply} className="px-3 py-1 text-slate-600 text-xs hover:text-slate-800">Cancel</button>
                                <button onClick={handleSubmitReply} disabled={isSubmittingReply || !replyContent.trim()} className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {isSubmittingReply ? 'Posting...' : 'Post Reply'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};