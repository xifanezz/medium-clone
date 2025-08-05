// src/hooks/useComments.ts

import { useState, useCallback } from "react";
import { api } from "../api";
import { PostComment, User } from "../types";

const updateCommentInTree = (
  comments: PostComment[],
  targetId: number,
  updater: (comment: PostComment) => PostComment
): PostComment[] => {
  return comments.map((comment) => {
    if (comment.id === targetId) {
      return updater(comment);
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentInTree(comment.replies, targetId, updater),
      };
    }
    return comment;
  });
};

const removeCommentFromTree = (
  comments: PostComment[],
  targetId: number
): PostComment[] => {
  return comments
    .map((comment) => {
      if (comment.id === targetId) return null;
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: removeCommentFromTree(comment.replies, targetId),
        };
      }
      return comment;
    })
    .filter((comment): comment is PostComment => comment !== null);
};

export const useComments = (postId: number, currentUser: User | null) => {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);

  const fetchComments = useCallback(
    async (page: number = 1, reset: boolean = false) => {
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);
      setError("");

      try {
        const result = await api.getPostComments(postId, page, 10);
        setComments((prev) =>
          reset ? result.data : [...prev, ...result.data]
        );
        setHasMore(result.pagination.hasMore);
        setCurrentPage(page);
      } catch (err: any) {
        setError(err.message || "Failed to load comments");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [postId]
  );

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchComments(currentPage + 1, false);
    }
  };

  const handleSubmitComment = async (content: string) => {
    if (!content.trim() || !currentUser) return;

    const tempId = Date.now();
    const optimisticComment: PostComment = {
      id: tempId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: currentUser,
      replies: [],
      repliesCount: 0,
    };

    setComments((prev) => [optimisticComment, ...prev]);
    setError("");

    try {
      const newCommentData = await api.addComment(postId, {
        content: optimisticComment.content,
      });
      setComments((prev) =>
        prev.map((c) => (c.id === tempId ? newCommentData : c))
      );
    } catch (err: any) {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setError(err.message || "Failed to post comment");
    }
  };

  const handleReply = async (parentId: number, content: string) => {
    try {
      const newReply = await api.addComment(postId, { content, parentId });
      setComments((prev) =>
        updateCommentInTree(prev, parentId, (parent) => ({
          ...parent,
          replies: [...(parent.replies || []), newReply],
          repliesCount: (parent.repliesCount || 0) + 1,
        }))
      );
      setExpandedReplies((prev) => [...prev, parentId]);
    } catch (err: any) {
      setError(err.message || "Failed to post reply");
    }
  };

  const handleEditComment = async () => {
    if (!editContent.trim() || !editingCommentId) return;
    try {
      const updatedComment = await api.updateComment(editingCommentId, {
        content: editContent.trim(),
      });
      setComments((prev) =>
        updateCommentInTree(prev, editingCommentId, () => updatedComment)
      );
      setEditingCommentId(null);
      setEditContent("");
    } catch (err: any) {
      setError(err.message || "Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const originalComments = [...comments];
    setComments((prevComments) =>
      removeCommentFromTree(prevComments, commentId)
    );
    try {
      await api.deleteComment(commentId);
    } catch (err: any) {
      setError("Failed to delete comment. Please try again.");
      setComments(originalComments);
    }
  };

  const toggleReplies = (commentId: number) => {
    setExpandedReplies((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    );
  };

  const startEdit = (comment: PostComment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const startReply = (commentId: number) => {
    setReplyingToId(commentId);
    setEditingCommentId(null);
  };

  const cancelReply = () => {
    setReplyingToId(null);
  };

  return {
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
  };
};
