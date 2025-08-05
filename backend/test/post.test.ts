// test/post.test.ts
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { sign } from 'hono/jwt';
import { Hono } from 'hono';

// Mock Prisma
const mockPrisma = {
  post: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
  tag: {
    upsert: vi.fn(),
  }
};

vi.mock('../src/lib/prisma', () => ({
  getPrisma: () => mockPrisma,
}));

// Mock TagGen
vi.mock('../src/lib/tagGen', () => ({
  TagGen: class {
    generateTags = vi.fn().mockResolvedValue({
      success: true,
      tags: ['testing', 'hono', 'vitest'],
    });
  },
}));

// Mock environment variables
const mockEnv = {
  SUPABASE_JWT_SECRET: 'test-jwt-secret',
};

// Mock all auth middleware functions
const MOCK_AUTH_USER_ID = 'test-user-123';
vi.mock('../src/middleware/auth', () => ({
  requireAuth: async (c: any, next: any) => {
    c.set('userId', MOCK_AUTH_USER_ID);
    await next();
  },
  optionalAuth: async (c: any, next: any) => {
    const authHeader = c.req.header('Authorization');
    if (authHeader) {
      c.set('userId', MOCK_AUTH_USER_ID);
    }
    await next();
  },
}));

// --- TYPE-SAFETY FIX ---
// Define a generic interface for our API responses.
interface ApiResponse<T> {
  data: T;
}

interface ApiMessageResponse {
    message: string;
}

describe('Post API Routes', () => {
  let app: Hono;

  beforeAll(async () => {
    const { default: createApp } = await import('../src/index');
    app = createApp;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/blog/create', () => {
    it('should create a new post and return only the post ID', async () => {
      const postInput = {
        title: 'Test Post',
        description: '<p>This is a test post content.</p>',
        published: true,
      };
      const mockCreatedPostResponse = { id: 1 };
      mockPrisma.post.create.mockResolvedValue(mockCreatedPostResponse);

      // --- FIX: Add the missing mock for prisma.tag.upsert ---
      // This ensures that the controller receives a valid tag object with an ID.
      mockPrisma.tag.upsert.mockImplementation((args: any) =>
        Promise.resolve({
          id: Math.floor(Math.random() * 1000),
          name: args.create.name,
        })
      );
      
      const token = await sign({ sub: MOCK_AUTH_USER_ID }, mockEnv.SUPABASE_JWT_SECRET);

      const request = new Request('http://localhost/api/v1/blog/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(postInput),
      });

      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(201);
      const responseBody = await response.json() as ApiResponse<{ id: number }>;
      expect(responseBody.data).toEqual({ id: 1 });
    });
  });

  describe('GET /api/v1/blog/allPosts', () => {
    it('should return all published posts with snippets', async () => {
      const mockPostsFromDb = [
        {
          id: 1,
          title: 'First Post',
          description: '<p>This is the full content of the first post.</p>',
          createdAt: new Date(),
          readTime: 1,
          imageUrl: null,
          author: { username: 'user1', displayName: 'User One', avatar: null },
          tags: [{ tag: { name: 'testing' } }],
          _count: { claps: 5, comments: 2, bookmarks: 1 },
          claps: [],
          bookmarks: [],
        },
      ];
      mockPrisma.post.findMany.mockResolvedValue(mockPostsFromDb);

      const request = new Request('http://localhost/api/v1/blog/allPosts');
      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      const responseBody = await response.json() as ApiResponse<any[]>;
      expect(responseBody.data).toHaveLength(1);
      expect(responseBody.data[0].snippet).toBe('This is the full content of the first post.');
      expect(responseBody.data[0].description).toBeUndefined();
    });
  });

  describe('GET /api/v1/blog/:id', () => {
    it('should return a specific post by ID with full description', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        description: '<p>Test content</p>',
        published: true,
        userId: 'user1',
        author: {},
        tags: [],
        _count: {},
      };
      mockPrisma.post.findUnique.mockResolvedValue(mockPost);

      const request = new Request('http://localhost/api/v1/blog/1');
      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      const responseBody = await response.json() as ApiResponse<typeof mockPost>;
      expect(responseBody.data.title).toBe('Test Post');
      expect(responseBody.data.description).toBe('<p>Test content</p>');
    });
  });

  describe('PUT /api/v1/blog/edit/:id', () => {
    it('should update a post and return only the post ID', async () => {
      const updateInput = { title: 'Updated Test Post' };
      const existingPost = { id: 1, userId: MOCK_AUTH_USER_ID };
      const updatedPostResponse = { id: 1 };

      mockPrisma.post.findUnique.mockResolvedValue(existingPost);
      mockPrisma.post.update.mockResolvedValue(updatedPostResponse);
      const token = await sign({ sub: MOCK_AUTH_USER_ID }, mockEnv.SUPABASE_JWT_SECRET);

      const request = new Request(`http://localhost/api/v1/blog/edit/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updateInput),
      });

      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      const responseBody = await response.json() as ApiResponse<{ id: number }>;
      expect(responseBody.data).toEqual({ id: 1 });
    });
  });

  describe('DELETE /api/v1/blog/delete/:id', () => {
    it('should delete a post with valid JWT', async () => {
      mockPrisma.post.deleteMany.mockResolvedValue({ count: 1 });
      const token = await sign({ sub: MOCK_AUTH_USER_ID }, mockEnv.SUPABASE_JWT_SECRET);

      const request = new Request(`http://localhost/api/v1/blog/delete/1`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      const responseBody = await response.json() as ApiMessageResponse;
      expect(responseBody.message).toBe('Post deleted successfully');
    });
  });
});
