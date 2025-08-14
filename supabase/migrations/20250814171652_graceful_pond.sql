/*
  # Initial Database Schema Setup

  1. New Tables
    - `users` - User profiles and authentication data
    - `posts` - Blog posts with content and metadata
    - `tags` - Content tags for categorization
    - `post_tags` - Many-to-many relationship between posts and tags
    - `claps` - User engagement (likes) on posts
    - `bookmarks` - User saved posts
    - `comments` - Post comments with nested replies support
    - `follows` - User following relationships

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Set up proper access controls

  3. Functions and Triggers
    - Auto-create user profile on auth signup
    - Update timestamps automatically
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  display_name text,
  bio text,
  avatar text,
  cover_image text,
  location text,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id serial PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  read_time integer,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Post tags junction table
CREATE TABLE IF NOT EXISTS post_tags (
  id serial PRIMARY KEY,
  post_id integer NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id integer NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(post_id, tag_id)
);

-- Claps table (likes/hearts)
CREATE TABLE IF NOT EXISTS claps (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id integer NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id integer NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Comments table (with nested replies support)
CREATE TABLE IF NOT EXISTS comments (
  id serial PRIMARY KEY,
  content text NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id integer NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id integer REFERENCES comments(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Follows table (user relationships)
CREATE TABLE IF NOT EXISTS follows (
  id serial PRIMARY KEY,
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE claps ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Posts policies
CREATE POLICY "Anyone can read published posts" ON posts
  FOR SELECT TO authenticated
  USING (published = true);

CREATE POLICY "Users can read own posts" ON posts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create posts" ON posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Tags policies (public read, authenticated write)
CREATE POLICY "Anyone can read tags" ON tags
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tags" ON tags
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Post tags policies
CREATE POLICY "Anyone can read post tags" ON post_tags
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can manage tags for own posts" ON post_tags
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.id = post_tags.post_id 
    AND posts.user_id = auth.uid()
  ));

-- Claps policies
CREATE POLICY "Anyone can read claps" ON claps
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can manage own claps" ON claps
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can read own bookmarks" ON bookmarks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks" ON bookmarks
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can read comments" ON comments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Users can read follows" ON follows
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can manage own follows" ON follows
  FOR ALL TO authenticated
  USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claps_updated_at
  BEFORE UPDATE ON claps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claps_post_id ON claps(post_id);
CREATE INDEX IF NOT EXISTS idx_claps_user_id ON claps(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);