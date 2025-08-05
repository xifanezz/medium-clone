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
    // 1. Render the component
    // We wrap it in BrowserRouter because it contains <Link> components
    render(
      <BrowserRouter>
        <BlogCard post={mockPost} />
      </BrowserRouter>
    );

    // 2. Assert that the content is on the screen
    expect(screen.getByText('My First Test Post')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('5 min read')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // Initial clap count
  });

  it('should optimistically update the clap count when the clap button is clicked', async () => {
    // 1. Setup user event simulation
    const user = userEvent.setup();
    
    // 2. Render the component
    render(
      <BrowserRouter>
        <BlogCard post={mockPost} />
      </BrowserRouter>
    );

    // 3. Find the clap button. We can use a title attribute for this.
    const clapButton = screen.getByTitle('Clap for this article');
    
    // 4. Assert initial state
    // We use queryByText because the count might be part of a larger string or absent
    expect(screen.getByText('10')).toBeInTheDocument();

    // 5. Simulate a user click
    await user.click(clapButton);

    // 6. Assert the optimistic UI update
    // The count should immediately go up by one, even before the API call finishes.
    expect(screen.getByText('11')).toBeInTheDocument();
  });
});
