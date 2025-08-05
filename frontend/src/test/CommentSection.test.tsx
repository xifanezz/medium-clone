/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentSection } from '../component/CommentSection';
import { useComments } from '../hooks/useComments';
import { User } from '../types';

// Mock the entire module. Vitest automatically replaces all its exports with mock functions.
vi.mock('../useComments');

// Mock child components to isolate the logic of CommentSection
vi.mock('./CommentItem', () => ({ CommentItem: ({ comment }: { comment: any }) => <div>{comment.content}</div> }));
vi.mock('./Avatar', () => ({ UserAvatar: () => <div data-testid="user-avatar" /> }));

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
  ...overrides, // Allow tests to override specific properties
});

describe('CommentSection', () => {
  const mockedUseComments = useComments as Mock;

  beforeEach(() => {
    mockedUseComments.mockClear();
  });

  it('should call handleSubmitComment when a new comment is submitted', async () => {
    const user = userEvent.setup();
    const handleSubmitComment = vi.fn();

    mockedUseComments.mockReturnValue(createMockUseComments({ handleSubmitComment }));

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

    mockedUseComments.mockReturnValue(createMockUseComments({ comments: mockComments }));

    render(<CommentSection postId={1} currentUser={mockCurrentUser} />);
    
    await userEvent.click(screen.getByRole('button', { name: /Comments/i }));

    expect(screen.getByText('First test comment')).toBeInTheDocument();
    expect(screen.getByText('Second test comment')).toBeInTheDocument();
  });
});
