/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlogCard } from '../component/BlogCard';
import { Post } from '../types';
import { BrowserRouter } from 'react-router-dom';

// Mock the API module to prevent real network calls during tests
vi.mock('../api', () => ({
  api: {
    toggleClap: vi.fn().mockResolvedValue({ isClapped: true, clapCount: 11 }),
    toggleBookmark: vi.fn(),
  },
}));

// Create a mock post object to pass as props
const mockPost: Post = {
  id: 1,
  title: 'My First Test Post',
  description: 'This is the content of the test post.',
  snippet: 'This is the content of the test post.',
  createdAt: new Date().toISOString(),
  readTime: 5,
  clapCount: 10,
  responseCount: 3,
  bookmarkCount: 2,
  isClapped: false,
  isBookmarked: false,
  tags: ['testing', 'react'],
  author: {
    username: 'testauthor',
    displayName: 'Test Author',
  },
};

// The test suite for the BlogCard component
describe('BlogCard', () => {
  it('should render the post title, author, and read time correctly', () => {
    render(
      <BrowserRouter>
        <BlogCard post={mockPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('My First Test Post')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('5 min read')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should optimistically update the clap count when the clap button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <BlogCard post={mockPost} />
      </BrowserRouter>
    );

    // --- FIX: Use getByLabelText to find the button by its accessibility label ---
    // Using a regular expression makes the query more robust.
    const clapButton = screen.getByLabelText(/Clap for this post/i);
    
    expect(screen.getByText('10')).toBeInTheDocument();

    await user.click(clapButton);

    expect(screen.getByText('11')).toBeInTheDocument();
  });
});
