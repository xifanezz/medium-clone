import { Context } from "hono";
import { getPrisma } from "../lib/prisma";
import { StatusCodes } from "../lib/constants";
import {
  postInputSchema,
  updatePostInputSchema,
} from "@sumitbhuia/medium_common";
import { TagGen } from "../lib/tagGen";

// Helper function to create a snippet from HTML
const createSnippet = (htmlContent: string, length = 150) => {
  if (!htmlContent) return '';
  const plainText = htmlContent.replace(/<[^>]+>/g, '');
  if (plainText.length <= length) return plainText;
  return plainText.substring(0, length) + '...';
};

const calculateReadTime = (htmlContent: string) => {
    const wordCount = htmlContent.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;
    return Math.ceil(wordCount / 225);
};

export async function getFeed(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const userId = c.get("userId");

  try {
    // Find all the users that the current user is following.
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    //  Extract their IDs into a simple array.
    const followingIds = following.map(f => f.followingId);
    // construct the feed
    const feedPosts = await prisma.post.findMany({
      where: {
        published: true,
        userId: {
          in: followingIds,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        readTime: true,
        imageUrl: true,
        author: { select: { username: true, displayName: true, avatar: true } },
        tags: { select: { tag: { select: { name: true } } } },
        _count: { select: { claps: true, comments: true, bookmarks: true } },
        claps: { where: { userId }, select: { id: true } },
        bookmarks: { where: { userId }, select: { id: true } },
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    const formattedPosts = feedPosts.map(post => ({
      id: post.id,
      title: post.title,
      snippet: createSnippet(post.description),
      createdAt: post.createdAt,
      readTime: post.readTime,
      imageUrl: post.imageUrl,
      author: post.author,
      tags: post.tags.map(t => t.tag.name),
      clapCount: post._count.claps,
      responseCount: post._count.comments,
      bookmarkCount: post._count.bookmarks,
      isClapped: !!post.claps?.length,
      isBookmarked: !!post.bookmarks?.length,
    }));

    return c.json({ data: formattedPosts }, StatusCodes.OK);
  } catch (error) {
    console.error("Error fetching personalized feed:", error);
    return c.json(
      { error: "Failed to fetch feed" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

export async function createPost(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const aiTagService = new TagGen(c.env.GEMINI_API_KEY);

  try {
    const body = await c.req.json();
    const parsedPost = postInputSchema.safeParse(body);

    if (!parsedPost.success) {
      return c.json({ error: "Invalid post input", details: parsedPost.error.errors }, StatusCodes.BAD_REQUEST);
    }

    const { title, description, imageUrl, published, tagIds } = parsedPost.data;
    const userId = c.get("userId");
    const readTime = calculateReadTime(description);

    let finalTagIds = tagIds;
    if (!tagIds || tagIds.length === 0) {
      const tagResult = await aiTagService.generateTags(description, title);
      if (tagResult.success) {
        const tagPromises = tagResult.tags.map(tagName =>
          prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName, description: `Auto-generated tag: ${tagName}` },
          })
        );
        const createdTags = await Promise.all(tagPromises);
        finalTagIds = createdTags.map(tag => tag.id);
      }
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        description,
        imageUrl,
        readTime,
        published,
        publishedAt: published ? new Date() : null,
        userId,
        ...(finalTagIds && finalTagIds.length > 0 && {
          tags: { create: finalTagIds.map((tagId: number) => ({ tagId })) },
        }),
      },
      select: {
        id: true,
      }
    });

    return c.json({ data: newPost }, StatusCodes.CREATED);
  } catch (error) {
    console.error("Error creating post:", error);
    return c.json({ error: "Failed to create post" }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function updatePostById(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);
  try {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const { title, description, imageUrl, published } = body; // Simplified parsing
    const userId = c.get("userId");

    const existingPost = await prisma.post.findUnique({
      where: { id, userId },
    });

    if (!existingPost) {
      return c.json({ error: "Post not found or you are not authorized" }, StatusCodes.NOT_FOUND);
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: title ?? existingPost.title,
        description: description ?? existingPost.description,
        imageUrl: imageUrl !== undefined ? imageUrl : existingPost.imageUrl,
        published: published ?? existingPost.published,
        readTime: description ? calculateReadTime(description) : existingPost.readTime,
        publishedAt: (published && !existingPost.published) ? new Date() : existingPost.publishedAt,
      },
      select: {
        id: true,
      }
    });

    return c.json({ data: updatedPost }, StatusCodes.OK);
  } catch (error) {
    console.error("Error updating post by ID:", error);
    return c.json({ error: "Failed to update post" }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function getAllPosts(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const currentUserId = c.get("userId");

  try {
    const allPosts = await prisma.post.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        readTime: true,
        imageUrl: true,
        author: { select: { username: true, displayName: true, avatar: true } },
        tags: { select: { tag: { select: { name: true } } } },
        _count: { select: { claps: true, comments: true, bookmarks: true } },
        claps: currentUserId ? { where: { userId: currentUserId }, select: { id: true } } : false,
        bookmarks: currentUserId ? { where: { userId: currentUserId }, select: { id: true } } : false,
      },
      orderBy: { publishedAt: "desc" },
    });

    const formattedPosts = allPosts.map(post => ({
      id: post.id,
      title: post.title,
      snippet: createSnippet(post.description),
      createdAt: post.createdAt,
      readTime: post.readTime,
      imageUrl: post.imageUrl,
      author: post.author,
      tags: post.tags.map(t => t.tag.name),
      clapCount: post._count.claps,
      responseCount: post._count.comments,
      bookmarkCount: post._count.bookmarks,
      isClapped: !!post.claps?.length,
      isBookmarked: !!post.bookmarks?.length,
    }));

    return c.json({ data: formattedPosts }, StatusCodes.OK);
  } catch (error) {
    console.error("Error fetching all posts:", error);
    return c.json({ error: "Failed to fetch posts" }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function getPostById(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);
  try {
    const pid = Number(c.req.param("id"));
    if (isNaN(pid)) return c.json({ error: "Invalid post ID" }, StatusCodes.BAD_REQUEST);

    const post = await prisma.post.findUnique({
      where: { id: pid },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        publishedAt: true,
        readTime: true,
        imageUrl: true,
        published: true,
        userId: true,
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
          },
        },
        tags: {
          select: {
            tag: { select: { name: true } },
          },
        },
        _count: {
          select: {
            claps: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!post) {
      return c.json({ error: "Post not found" }, StatusCodes.NOT_FOUND);
    }

    if (!post.published) {
      const userId = c.get("userId");
      if (post.userId !== userId) {
        return c.json({ error: "Unauthorized" }, StatusCodes.UNAUTHORIZED);
      }
    }
    
    // Format the tags into a simple array
    const formattedPost = {
        ...post,
        tags: post.tags.map(t => t.tag.name)
    };

    return c.json({ data: formattedPost }, StatusCodes.OK);
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    return c.json({ error: "Failed to fetch post" }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function deletePostById(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);
  try {
    const id = Number(c.req.param("id"));
    const userId = c.get("userId");

    const deleteResult = await prisma.post.deleteMany({
      where: { id, userId },
    });

    if (deleteResult.count === 0) {
      return c.json({ error: "Post not found or you are not authorized" }, StatusCodes.NOT_FOUND);
    }

    return c.json({ message: "Post deleted successfully" }, StatusCodes.OK);
  } catch (error) {
    console.error("Error deleting post by ID:", error);
    return c.json({ error: "Failed to delete post" }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}
