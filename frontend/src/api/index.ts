import { supabase } from "../lib/supabaseClient";
import {
  UserProfile,
  Post,
  UpdateUserProfilePayload,
  CreateCommentPayload,
  CommentResponse,
  UpdateCommentPayload,
  PostComment,
} from "../types";

const BASE_URL =
  import.meta.env.VITE_BASE_URL || process.env.REACT_APP_BASE_URL;

const getAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  if (!accessToken) {
    console.warn("No access token found for API request.");
  }

  return {
    Authorization: `Bearer ${accessToken || ""}`,
    "Content-Type": "application/json",
  };
};

const handleApiError = async (response: Response) => {
  if (response.status === 401 || response.status === 403) {
    window.location.href = "/signin";
    return new Promise(() => {});
  }
  const errorResult = await response.json().catch(() => ({
    error: `An unknown error occurred (status: ${response.status})`,
  }));
  throw new Error(errorResult.error || "An unexpected error occurred.");
};

export const api = {
  async getFeed(): Promise<Post[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/blog/feed`, { headers });
    if (!response.ok) await handleApiError(response);
    return (await response.json()).data;
  },

  async getPostById(postId: number): Promise<Post> {
    const response = await fetch(`${BASE_URL}/api/v1/blog/${postId}`);
    if (!response.ok) await handleApiError(response);
    return (await response.json()).data;
  },

  async getAllPost(): Promise<Post[]> {
    const response = await fetch(`${BASE_URL}/api/v1/blog/allPosts`);
    if (!response.ok) await handleApiError(response);
    return (await response.json()).data;
  },

  async editPostById(
    postId: number,
    title: string,
    description: string,
    imageUrl?: string | null
  ): Promise<{ id: number }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/blog/edit/${postId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ title, description, imageUrl }),
    });
    if (!response.ok) await handleApiError(response);
    return (await response.json()).data;
  },

  async createPost(
    title: string,
    description: string,
    imageUrl?: string
  ): Promise<{ id: number }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/blog/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({ title, description, imageUrl, published: true }),
    });
    if (!response.ok) await handleApiError(response);
    return (await response.json()).data;
  },

  async getUserProfile(username: string): Promise<UserProfile> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/user/${username}`, {
      headers,
    });
    if (!response.ok) await handleApiError(response);
    return (await response.json()).data;
  },

  async getUserPosts(
    username: string,
    page: number = 1
  ): Promise<{ data: Post[]; pagination: any }> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v1/user/${username}/posts?page=${page}&limit=10`,
      {
        headers,
      }
    );
    if (!response.ok) await handleApiError(response);
    return await response.json();
  },

  async updateUserProfile(
    payload: UpdateUserProfilePayload
  ): Promise<UserProfile> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/user/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) await handleApiError(response);
    return (await response.json()).data;
  },

  async getUserBookmarks(
    page: number = 1
  ): Promise<{ data: Post[]; pagination: any }> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v1/stats/bookmarks?page=${page}&limit=10`,
      { headers }
    );
    if (!response.ok) await handleApiError(response);
    return await response.json();
  },

  async toggleClap(
    postId: number
  ): Promise<{ isClapped: boolean; clapCount: number }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/stats/clap/${postId}`, {
      method: "POST",
      headers,
    });
    if (!response.ok) await handleApiError(response);
    return (await response.json()).data;
  },

  async toggleBookmark(postId: number): Promise<{ isBookmarked: boolean }> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v1/stats/bookmark/${postId}`,
      { method: "POST", headers }
    );
    if (!response.ok) await handleApiError(response);
    return (await response.json()).data;
  },

  async toggleFollow(username: string): Promise<{ isFollowing: boolean }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/user/follow/${username}`, {
      method: "POST",
      headers,
    });
    if (!response.ok) await handleApiError(response);
    return (await response.json()).data;
  },

  async getPostComments(
    postId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<CommentResponse> {
    const response = await fetch(
      `${BASE_URL}/api/v1/stats/comments/${postId}?page=${page}&limit=${limit}`
    );
    if (!response.ok) await handleApiError(response);
    return await response.json();
  },

  async addComment(
    postId: number,
    payload: CreateCommentPayload
  ): Promise<PostComment> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/v1/stats/comment/${postId}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) await handleApiError(response);
    return (await response.json()).data;
  },

  async updateComment(
    commentId: number,
    payload: UpdateCommentPayload
  ): Promise<PostComment> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v1/stats/comment/${commentId}`,
      { method: "PUT", headers, body: JSON.stringify(payload) }
    );
    if (!response.ok) await handleApiError(response);
    return (await response.json()).data;
  },

  async deleteComment(commentId: number): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${BASE_URL}/api/v1/stats/comment/${commentId}`,
      { method: "DELETE", headers }
    );
    if (!response.ok) await handleApiError(response);
  },
};
