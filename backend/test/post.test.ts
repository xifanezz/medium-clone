// test/api.test.ts
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
    delete: vi.fn(),
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
vi.mock('../src/middleware/auth', () => ({
  requireAuth: async (c: any, next: any) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Authorization header missing or invalid' }, 401);
    }
    // For testing, just set a test user ID
    c.set('userId', 'test-user-123');
    c.set('userEmail', 'test@example.com');
    c.set('userRole', 'user');
    await next();
  },
  optionalAuth: async (c: any, next: any) => {
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // If there's an auth header, set user context
      c.set('userId', 'test-user-123');
      c.set('userEmail', 'test@example.com');
      c.set('userRole', 'user');
    }
    // Always continue to next middleware
    await next();
  },
  requireRole: (...allowedRoles: string[]) => async (c: any, next: any) => {
    const userRole = c.get('userRole') || 'user';
    if (!allowedRoles.includes(userRole)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    await next();
  },
}));

describe('Post API Routes', () => {
  let app: Hono;

  beforeAll(async () => {
    // Dynamically import your app after mocks are set up
    const { default: createApp } = await import('../src/index');
    app = createApp;
  });

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('POST /api/v1/blog/create', () => {
    it('should create a new post with valid JWT and request body', async () => {
      // Setup mock data
      const mockUserId = 'test-user-123';
      const postInput = {
        title: 'Test Post',
        description: '<p>This is a test post content.</p>',
        published: true,
      };

      const mockCreatedPost = {
        id: 1,
        ...postInput,
        userId: mockUserId,
        readTime: 1,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: null,
        author: {
          id: mockUserId,
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          avatar: null,
        },
        tags: [],
        _count: {
          claps: 0,
          comments: 0,
          bookmarks: 0,
        },
      };

      // Mock the tag upsert calls
      mockPrisma.tag.upsert.mockImplementation((args: any) =>
        Promise.resolve({
          id: Math.floor(Math.random() * 1000),
          name: args.create.name,
          description: args.create.description,
        })
      );

      // Mock the post creation
      mockPrisma.post.create.mockResolvedValue(mockCreatedPost);

      // Create JWT token
      const jwtSecret = mockEnv.SUPABASE_JWT_SECRET;
      const token = await sign({ sub: mockUserId }, jwtSecret);

      // Create request
      const request = new Request('http://localhost/api/v1/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postInput),
      });

      // Make the request using the Hono app
      const response = await app.fetch(request, mockEnv);

      // Assertions
      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody.data.title).toBe(postInput.title);
      expect(responseBody.data.userId).toBe(mockUserId);
      expect(mockPrisma.post.create).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for requests without authorization header', async () => {
      const postInput = {
        title: 'Unauthorized Post',
        description: '<p>This should fail.</p>',
        published: true,
      };

      const request = new Request('http://localhost/api/v1/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postInput),
      });

      const response = await app.fetch(request, mockEnv);
      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid post input', async () => {
      const mockUserId = 'test-user-123';
      const jwtSecret = mockEnv.SUPABASE_JWT_SECRET;
      const token = await sign({ sub: mockUserId }, jwtSecret);

      const invalidPostInput = {
        // Missing required fields like title
        description: '<p>Missing title.</p>',
      };

      const request = new Request('http://localhost/api/v1/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(invalidPostInput),
      });

      const response = await app.fetch(request, mockEnv);
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/blog/allPosts', () => {
    it('should return all published posts', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'First Post',
          description: '<p>Content 1</p>',
          published: true,
          publishedAt: new Date(),
          author: {
            id: 'user1',
            username: 'user1',
            email: 'user1@example.com',
            displayName: 'User One',
            avatar: null,
          },
          tags: [],
          _count: { claps: 5, comments: 2, bookmarks: 1 },
        },
        {
          id: 2,
          title: 'Second Post',
          description: '<p>Content 2</p>',
          published: true,
          publishedAt: new Date(),
          author: {
            id: 'user2',
            username: 'user2',
            email: 'user2@example.com',
            displayName: 'User Two',
            avatar: null,
          },
          tags: [],
          _count: { claps: 3, comments: 1, bookmarks: 0 },
        },
      ];

      mockPrisma.post.findMany.mockResolvedValue(mockPosts);

      const request = new Request('http://localhost/api/v1/blog/allPosts');
      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.data).toHaveLength(2);
      expect(responseBody.data[0].title).toBe('First Post');
      expect(mockPrisma.post.findMany).toHaveBeenCalledWith({
        where: { published: true },
        include: expect.any(Object),
        orderBy: { publishedAt: 'desc' },
      });
    });
  });

  describe('GET /api/v1/blog/:id', () => {
    it('should return a specific post by ID', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        description: '<p>Test content</p>',
        published: true,
        publishedAt: new Date(),
        userId: 'user1',
        author: {
          id: 'user1',
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          avatar: null,
          bio: 'Test bio',
        },
        tags: [],
        comments: [],
        _count: { claps: 0, comments: 0, bookmarks: 0 },
      };

      mockPrisma.post.findUnique.mockResolvedValue(mockPost);

      const request = new Request('http://localhost/api/v1/blog/1');
      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.data.title).toBe('Test Post');
      expect(mockPrisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
    });

    it('should return 404 for non-existent post', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      const request = new Request('http://localhost/api/v1/blog/999');
      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/blog/edit/:id', () => {
    it('should update a post with valid JWT and request body', async () => {
      const mockUserId = 'test-user-123';
      const postId = 1;
      const updateInput = {
        title: 'Updated Test Post',
        description: '<p>Updated content</p>',
        published: true,
      };

      const existingPost = {
        id: postId,
        title: 'Original Post',
        description: '<p>Original content</p>',
        published: false,
        userId: mockUserId,
        readTime: 1,
      };

      const updatedPost = {
        ...existingPost,
        ...updateInput,
        publishedAt: new Date(),
      };

      mockPrisma.post.findUnique.mockResolvedValue(existingPost);
      mockPrisma.post.update.mockResolvedValue(updatedPost);

      const jwtSecret = mockEnv.SUPABASE_JWT_SECRET;
      const token = await sign({ sub: mockUserId }, jwtSecret);

      const request = new Request(`http://localhost/api/v1/blog/edit/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateInput),
      });

      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.data.title).toBe('Updated Test Post');
      expect(mockPrisma.post.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /api/v1/blog/delete/:id', () => {
    it('should delete a post with valid JWT', async () => {
      const mockUserId = 'test-user-123';
      const postId = 1;

      const existingPost = {
        id: postId,
        title: 'Post to Delete',
        userId: mockUserId,
      };

      mockPrisma.post.findUnique.mockResolvedValue(existingPost);
      mockPrisma.post.delete.mockResolvedValue(existingPost);

      const jwtSecret = mockEnv.SUPABASE_JWT_SECRET;
      const token = await sign({ sub: mockUserId }, jwtSecret);

      const request = new Request(`http://localhost/api/v1/blog/delete/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.message).toBe('Post deleted successfully');
      expect(mockPrisma.post.delete).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for delete request without authorization', async () => {
      const request = new Request('http://localhost/api/v1/blog/delete/1', {
        method: 'DELETE',
      });

      const response = await app.fetch(request, mockEnv);
      expect(response.status).toBe(401);
    });
  });
});