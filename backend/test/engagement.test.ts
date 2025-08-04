// test/engagement.test.ts
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { sign } from 'hono/jwt';
import { Hono } from 'hono';

// Mock Prisma with all necessary methods for engagement
const mockPrisma = {
  post: { findUnique: vi.fn() },
  clap: { findUnique: vi.fn(), delete: vi.fn(), create: vi.fn(), aggregate: vi.fn() },
  bookmark: { findUnique: vi.fn(), delete: vi.fn(), create: vi.fn(), findMany: vi.fn() },
  comment: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
};

vi.mock('../src/lib/prisma', () => ({
  getPrisma: () => mockPrisma,
}));

// Mock Auth Middleware
const MOCK_AUTH_USER_ID = 'current-user-123';
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

// Define mock environment variables
const mockEnv = {
  SUPABASE_JWT_SECRET: 'test-jwt-secret',
};

describe('Engagement API Routes', () => {
  let app: Hono;

  beforeAll(async () => {
    const { default: createApp } = await import('../src/index');
    app = createApp;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/stats/clap/:postId', () => {
    it('should add a clap to a post if not already clapped', async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.clap.findUnique.mockResolvedValue(null); // Not clapped yet
      mockPrisma.clap.create.mockResolvedValue({ id: 1, userId: MOCK_AUTH_USER_ID, postId: 1 });
      mockPrisma.clap.aggregate.mockResolvedValue({ _sum: { count: 10 } });
      const token = await sign({ sub: MOCK_AUTH_USER_ID }, mockEnv.SUPABASE_JWT_SECRET);

      const request = new Request('http://localhost/api/v1/stats/clap/1', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.isClapped).toBe(true);
      expect(body.data.clapCount).toBe(10);
      expect(mockPrisma.clap.create).toHaveBeenCalledTimes(1);
    });

    it('should remove a clap from a post if already clapped', async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.clap.findUnique.mockResolvedValue({ id: 1, userId: MOCK_AUTH_USER_ID, postId: 1 }); // Already clapped
      mockPrisma.clap.delete.mockResolvedValue({});
      mockPrisma.clap.aggregate.mockResolvedValue({ _sum: { count: 9 } });
      const token = await sign({ sub: MOCK_AUTH_USER_ID }, mockEnv.SUPABASE_JWT_SECRET);

      const request = new Request('http://localhost/api/v1/stats/clap/1', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await app.fetch(request, mockEnv);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.isClapped).toBe(false);
      expect(body.data.clapCount).toBe(9);
      expect(mockPrisma.clap.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/v1/stats/bookmark/:postId', () => {
    it('should add a bookmark to a post', async () => {
        mockPrisma.post.findUnique.mockResolvedValue({ id: 1 });
        mockPrisma.bookmark.findUnique.mockResolvedValue(null); // Not bookmarked
        mockPrisma.bookmark.create.mockResolvedValue({});
        const token = await sign({ sub: MOCK_AUTH_USER_ID }, mockEnv.SUPABASE_JWT_SECRET);

        const request = new Request('http://localhost/api/v1/stats/bookmark/1', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        const response = await app.fetch(request, mockEnv);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.data.isBookmarked).toBe(true);
    });

    it('should remove a bookmark from a post', async () => {
        mockPrisma.post.findUnique.mockResolvedValue({ id: 1 });
        mockPrisma.bookmark.findUnique.mockResolvedValue({ id: 1 }); // Is bookmarked
        mockPrisma.bookmark.delete.mockResolvedValue({});
        const token = await sign({ sub: MOCK_AUTH_USER_ID }, mockEnv.SUPABASE_JWT_SECRET);

        const request = new Request('http://localhost/api/v1/stats/bookmark/1', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        const response = await app.fetch(request, mockEnv);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.data.isBookmarked).toBe(false);
    });
  });

  describe('GET /api/v1/stats/bookmarks', () => {
    it("should return a user's bookmarked posts", async () => {
        // This mock needs to be more detailed to match the controller's includes
        const mockBookmarks = [{
            createdAt: new Date(),
            post: {
                id: 1,
                title: 'Bookmarked Post',
                description: 'Content',
                createdAt: new Date(),
                readTime: 5,
                author: { username: 'author', displayName: 'Author' },
                _count: { claps: 1, comments: 1, bookmarks: 1 },
                tags: [{ tag: { name: 'test' } }]
            }
        }];
        mockPrisma.bookmark.findMany.mockResolvedValue(mockBookmarks);
        const token = await sign({ sub: MOCK_AUTH_USER_ID }, mockEnv.SUPABASE_JWT_SECRET);

        const request = new Request('http://localhost/api/v1/stats/bookmarks', {
            headers: { Authorization: `Bearer ${token}` },
        });
        const response = await app.fetch(request, mockEnv);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.data).toHaveLength(1);
        expect(body.data[0].title).toBe('Bookmarked Post');
    });
  });

  describe('POST /api/v1/stats/comment/:postId', () => {
    it('should add a new comment to a post', async () => {
        const commentData = { content: 'This is a new comment' };
        const mockCreatedComment = { 
            id: 1, 
            ...commentData, 
            createdAt: new Date(), 
            updatedAt: new Date(),
            user: { username: 'testuser', displayName: 'Test User' },
            _count: { replies: 0 }
        };

        mockPrisma.post.findUnique.mockResolvedValue({ id: 1 });
        mockPrisma.comment.create.mockResolvedValue(mockCreatedComment);
        const token = await sign({ sub: MOCK_AUTH_USER_ID }, mockEnv.SUPABASE_JWT_SECRET);

        const request = new Request('http://localhost/api/v1/stats/comment/1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(commentData),
        });
        const response = await app.fetch(request, mockEnv);

        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.data.content).toBe(commentData.content);
    });
  });

  describe('DELETE /api/v1/stats/comment/:commentId', () => {
    it("should delete a user's own comment", async () => {
        // Simulate that the comment exists and belongs to the current user
        mockPrisma.comment.findUnique.mockResolvedValue({ userId: MOCK_AUTH_USER_ID });
        mockPrisma.comment.delete.mockResolvedValue({});
        const token = await sign({ sub: MOCK_AUTH_USER_ID }, mockEnv.SUPABASE_JWT_SECRET);

        const request = new Request('http://localhost/api/v1/stats/comment/1', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        const response = await app.fetch(request, mockEnv);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.message).toBe('Comment deleted successfully');
    });

    it("should return 403 when trying to delete another user's comment", async () => {
        // Simulate that the comment exists but belongs to a different user
        mockPrisma.comment.findUnique.mockResolvedValue({ userId: 'another-user-id' });
        const token = await sign({ sub: MOCK_AUTH_USER_ID }, mockEnv.SUPABASE_JWT_SECRET);

        const request = new Request('http://localhost/api/v1/stats/comment/1', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        const response = await app.fetch(request, mockEnv);

        expect(response.status).toBe(403);
    });
  });
});