/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentSection } from '../component/CommentSection';
import * as useCommentsHook from '../hooks/useComments'; // Import the entire module as an object
import { User } from '../types';

// Mock child components
vi.mock('../component/CommentItem', () => ({ CommentItem: ({ comment }: { comment: any }) => <div>{comment.content}</div> }));
vi.mock('../component/Avatar', () => ({ UserAvatar: () => <div data-testid="user-avatar" /> }));

const mockCurrentUser: User = {
  username: 'testuser',
  displayName: 'Test User',
};

const createMockUseComments = (overrides = {}) => ({
  comments: [],
  isLoading: false,
  error: null,
  editingCommentId: null,
  editContent: '',
  setEditContent: vi.fn(),
  expandedReplies: [],
  hasMore: false,
  isLoadingMore: false,
  replyingToId: null,
  fetchComments: vi.fn(),
  handleLoadMore: vi.fn(),
  handleSubmitComment: vi.fn(),
  handleReply: vi.fn(),
  handleEditComment: vi.fn(),
  handleDeleteComment: vi.fn(),
  toggleReplies: vi.fn(),
  startEdit: vi.fn(),
  cancelEdit: vi.fn(),
  startReply: vi.fn(),
  cancelReply: vi.fn(),
  ...overrides,
});

describe('CommentSection', () => {
  // --- FIX: Use vi.spyOn to control the mock for each test ---
  let useCommentsSpy: any;

  beforeEach(() => {
    // Before each test, we create a spy on the useComments function
    useCommentsSpy = vi.spyOn(useCommentsHook, 'useComments');
  });

  it('should call handleSubmitComment when a new comment is submitted', async () => {
    const user = userEvent.setup();
    const handleSubmitComment = vi.fn();

    // Now we can safely control the return value for this specific test
    useCommentsSpy.mockReturnValue(createMockUseComments({ handleSubmitComment }));

    render(<CommentSection postId={1} currentUser={mockCurrentUser} />);
    
    await user.click(screen.getByRole('button', { name: /Comments/i }));
    const textarea = screen.getByPlaceholderText('Add a comment...');
    await user.type(textarea, 'This is a new test comment');
    const submitButton = screen.getByRole('button', { name: 'Comment' });
    await user.click(submitButton);

    expect(handleSubmitComment).toHaveBeenCalledWith('This is a new test comment');
  });

  it('should render existing comments', async () => {
    const mockComments = [
      { id: 1, content: 'First test comment', user: mockCurrentUser, replies: [] },
      { id: 2, content: 'Second test comment', user: mockCurrentUser, replies: [] },
    ];

    useCommentsSpy.mockReturnValue(createMockUseComments({ comments: mockComments }));

    render(<CommentSection postId={1} currentUser={mockCurrentUser} />);
    
    await userEvent.click(screen.getByRole('button', { name: /Comments/i }));

    expect(screen.getByText('First test comment')).toBeInTheDocument();
    expect(screen.getByText('Second test comment')).toBeInTheDocument();
  });
});
