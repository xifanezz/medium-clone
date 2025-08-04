// test/user.test.ts
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { sign } from 'hono/jwt';
import { Hono } from 'hono';

// Mock Prisma with all necessary methods
const mockPrisma = {
  user: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  post: { findMany: vi.fn() },
  follow: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
};

vi.mock('../src/lib/prisma', () => ({
  getPrisma: () => mockPrisma,
}));

// Mock Auth Middleware with a CONSISTENT user ID
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

describe('User API Routes', () => {
  let app: Hono;

  beforeAll(async () => {
    const { default: createApp } = await import('../src/index');
    app = createApp;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/user/:username', () => {
    it('should return user profile for existing user without auth', async () => {
      const mockUser = { id: 'user-123', username: 'testuser', createdAt: new Date(), _count: {}, followers: [] };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const request = new Request('http://localhost/api/v1/user/testuser');
      const response = await app.fetch(request, mockEnv);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.isOwnProfile).toBe(false);
    });

    it('should return user profile with follow status when authenticated', async () => {
      const mockUser = { id: 'user-123', username: 'testuser', createdAt: new Date(), _count: {}, followers: [{ id: 'follow-id' }] };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const token = await sign({ sub: MOCK_AUTH_USER_ID }, mockEnv.SUPABASE_JWT_SECRET);
      const request = new Request('http://localhost/api/v1/user/testuser', { headers: { Authorization: `Bearer ${token}` } });
      const response = await app.fetch(request, mockEnv);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.isFollowing).toBe(true);
    });

    it('should indicate own profile when viewing own user', async () => {
      const mockUser = {
        id: MOCK_AUTH_USER_ID,
        username: 'currentuser',
        createdAt: new Date(),
        _count: { posts: 5, followers: 10, following: 8 },
        followers: [],
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const token = await sign({ sub: MOCK_AUTH_USER_ID }, mockEnv.SUPABASE_JWT_SECRET);
      const request = new Request('http://localhost/api/v1/user/currentuser', { headers: { Authorization: `Bearer ${token}` } });
      const response = await app.fetch(request, mockEnv);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.isOwnProfile).toBe(true);
    });

    it('should return 404 for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const request = new Request('http://localhost/api/v1/user/nonexistent');
      const response = await app.fetch(request, mockEnv);
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/v1/user/:username/posts', () => {
    it('should return user posts with pagination', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-123' });
        const mockPosts = [{ 
            id: 1, 
            title: 'User Post 1', 
            createdAt: new Date(), 
            publishedAt: new Date(),
            description: 'content',
            author: {},
            _count: {},
            claps: [],
            bookmarks: [],
            tags: []
        }];
        mockPrisma.post.findMany.mockResolvedValue(mockPosts);
        
        const request = new Request('http://localhost/api/v1/user/testuser/posts?page=1&limit=10');
        const response = await app.fetch(request, mockEnv);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.data).toHaveLength(1);
        expect(body.pagination.page).toBe(1);
    });
  });
  
  describe('PUT /api/v1/user/profile', () => {
    it('should update user profile with valid data', async () => {
        const updateData = { displayName: 'Updated Name', bio: 'Updated bio' };
        const updatedUser = { id: MOCK_AUTH_USER_ID, ...updateData, createdAt: new Date(), _count: {} };
        
        mockPrisma.user.findFirst.mockResolvedValue(null);
        mockPrisma.user.update.mockResolvedValue(updatedUser);
        const token = await sign({ sub: MOCK_AUTH_USER_ID }, mockEnv.SUPABASE_JWT_SECRET);

        const request = new Request('http://localhost/api/v1/user/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(updateData),
        });
        const response = await app.fetch(request, mockEnv);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.data.displayName).toBe('Updated Name');
    });
  });
  
  describe('POST /api/v1/user/follow/:username', () => {
    it('should follow a user when not already following', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-to-follow-456' });
        mockPrisma.follow.findUnique.mockResolvedValue(null);
        mockPrisma.follow.create.mockResolvedValue({});
        const token = await sign({ sub: MOCK_AUTH_USER_ID }, mockEnv.SUPABASE_JWT_SECRET);

        const request = new Request('http://localhost/api/v1/user/follow/targetuser', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        const response = await app.fetch(request, mockEnv);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.data.isFollowing).toBe(true);
    });
  });
});
