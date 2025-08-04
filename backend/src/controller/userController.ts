import { Context } from "hono";
import { getPrisma } from "../lib/prisma";
import {StatusCodes}  from "../lib/constants";

// Get user profile by username
export async function getUserProfile(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);
  try {
    const username = c.req.param("username");
    const currentUserId = c.get("userId");
    // console.log(username)
    // console.log(currentUserId)

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
        coverImage: true,
        location: true,
        website: true,
        createdAt: true,
        _count: {
          select: {
            posts: { where: { published: true } },
            followers: true,
            following: true,
          },
        },
        followers: currentUserId
          ? { where: { followerId: currentUserId }, select: { id: true } }
          : false,
      },
    });

    // console.log(user)

    if (!user) {
      return c.json({ error: "User not found" }, StatusCodes.NOT_FOUND);
    }

    const userProfile = {
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      bio: user.bio || "",
      avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`,
      coverImage: user.coverImage,
      location: user.location,
      website: user.website,
      joinedDate: user.createdAt.toISOString(),
      followersCount: user._count.followers,
      followingCount: user._count.following,
      postsCount: user._count.posts,
      isFollowing: currentUserId ? user.followers.length > 0 : false,
      isOwnProfile: currentUserId === user.id,
    };
    return c.json({ data: userProfile }, StatusCodes.OK);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return c.json({ error: "Failed to fetch user profile" }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

// Get user's posts
export async function getUserPosts(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);
  try {
    const username = c.req.param("username");
    const currentUserId = c.get("userId");
    
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!user) {
      return c.json({ error: "User not found" }, StatusCodes.NOT_FOUND);
    }

    const posts = await prisma.post.findMany({
      where: { userId: user.id, published: true },
      include: {
        author: { select: { username: true, displayName: true, avatar: true } },
        _count: { select: { claps: true, comments: true, bookmarks: true } },
        claps: currentUserId ? { where: { userId: currentUserId } } : false,
        bookmarks: currentUserId ? { where: { userId: currentUserId } } : false,
        tags: { include: { tag: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id.toString(),
      title: post.title,
      description: post.description,
      createdAt: post.createdAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString(),
      readTime: post.readTime || Math.ceil(post.description.replace(/<[^>]+>/g, "").split(/\s+/).length / 225),
      imageUrl: post.imageUrl,
      User: {
        username: post.author.username,
        displayName: post.author.displayName,
        avatar: post.author.avatar,
      },
      clapCount: post._count.claps,
      responseCount: post._count.comments,
      bookmarkCount: post._count.bookmarks,
      isClapped: currentUserId ? post.claps.length > 0 : false,
      isBookmarked: currentUserId ? post.bookmarks.length > 0 : false,
      tags: post.tags.map((pt) => pt.tag.name),
    }));

    return c.json({
        data: formattedPosts,
        pagination: { page, limit, hasMore: posts.length === limit },
      },
      StatusCodes.OK
    );
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return c.json({ error: "Failed to fetch user posts" }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

// Update user profile
export async function updateUserProfile(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const userId = c.get("userId");
    const body = await c.req.json();

    const {
      displayName,
      bio,
      avatar,
      coverImage,
      location,
      website,
      username,
    } = body;

    // Check if username is taken (if being updated)
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return c.json(
          { error: "Username already taken" },
          StatusCodes.CONFLICT
        );
      }
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
        ...(coverImage !== undefined && { coverImage }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(username !== undefined && { username }),
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
        coverImage: true,
        location: true,
        website: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            posts: { where: { published: true } },
            followers: true,
            following: true,
          },
        },
      },
    });

    const userProfile = {
      id: updatedUser.id,
      username: updatedUser.username,
      displayName: updatedUser.displayName || updatedUser.username,
      bio: updatedUser.bio || "",
      avatar: updatedUser.avatar || `https://api.dicebear.com/9.x/thumbs/svg?seed=${updatedUser.username}`,
      coverImage: updatedUser.coverImage,
      location: updatedUser.location,
      website: updatedUser.website,
      email: updatedUser.email,
      joinedDate: updatedUser.createdAt.toISOString(),
      followersCount: updatedUser._count.followers,
      followingCount: updatedUser._count.following,
      postsCount: updatedUser._count.posts,
      isOwnProfile: true,
    };

    return c.json({ data: userProfile }, StatusCodes.OK);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return c.json(
      { error: "Failed to update profile" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// Follow/Unfollow user
export async function toggleFollow(c: Context) {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const followerId = c.get("userId");
    const followingUsername = c.req.param("username");

    // Get the user to follow
    const userToFollow = await prisma.user.findUnique({
      where: { username: followingUsername },
      select: { id: true },
    });

    if (!userToFollow) {
      return c.json({ error: "User not found" }, StatusCodes.NOT_FOUND);
    }

    if (followerId === userToFollow.id) {
      return c.json(
        { error: "Cannot follow yourself" },
        StatusCodes.BAD_REQUEST
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userToFollow.id,
        },
      },
    });

    let isFollowing: boolean;

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });
      isFollowing = false;
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId,
          followingId: userToFollow.id,
        },
      });
      isFollowing = true;
    }

    return c.json(
      {
        data: { isFollowing },
      },
      StatusCodes.OK
    );
  } catch (error) {
    console.error("Error toggling follow:", error);
    return c.json(
      { error: "Failed to toggle follow" },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}