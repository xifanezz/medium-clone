# Supabase Setup Guide

This guide will help you connect your Supabase project to this Medium clone application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js installed on your machine
3. Supabase CLI installed (`npm install -g supabase`)

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in your project details:
   - **Name**: `medium-clone` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
5. Click "Create new project"

## Step 2: Get Your Project Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (something like `https://xxxxx.supabase.co`)
   - **Project API Keys** → **anon public** key
   - **Project API Keys** → **service_role** key (keep this secret!)

3. Go to **Settings** → **Database**
4. Copy the **Connection string** → **URI** (this is your DATABASE_URL)

5. For the JWT Secret:
   - Go to **Settings** → **API**
   - Copy the **JWT Secret**

## Step 3: Configure Environment Variables

Update your `.env` file with your Supabase credentials:

```env
# Replace these with your actual Supabase values
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# For backend (Cloudflare Workers)
SUPABASE_JWT_SECRET=your_jwt_secret_here
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
DIRECT_DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres

# Optional: Add your Gemini API key for AI-powered tagging
GEMINI_API_KEY=your_gemini_api_key_here

# Base URL for API calls (adjust for production)
VITE_BASE_URL=http://localhost:8787
```

## Step 4: Set Up Database Schema

You have two options:

### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL editor and click "Run"

### Option B: Using Supabase CLI (Recommended for developers)

1. Initialize Supabase in your project:
   ```bash
   supabase init
   ```

2. Link to your remote project:
   ```bash
   supabase link --project-ref your-project-id
   ```

3. Push the migration:
   ```bash
   supabase db push
   ```

## Step 5: Set Up Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Create the following buckets:
   - `avatars` (for user profile pictures)
   - `covers` (for user cover images)  
   - `post-images` (for blog post featured images)

3. For each bucket, set the following policies:
   - **Public access**: Enable if you want images to be publicly viewable
   - **File size limit**: Set to 5MB or your preferred limit
   - **Allowed file types**: `image/jpeg, image/png, image/webp`

## Step 6: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure your **Site URL**: `http://localhost:3000` (for development)
3. Add **Redirect URLs**: 
   - `http://localhost:3000`
   - Your production URL when ready

### Enable Google OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - Get these from [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs: `https://your-project-id.supabase.co/auth/v1/callback`

## Step 7: Test the Connection

1. Start your development servers:
   ```bash
   # Frontend
   cd frontend
   npm run dev
   
   # Backend (in another terminal)
   cd backend
   npm run dev
   ```

2. Try signing up for a new account
3. Check if the user appears in your Supabase **Authentication** → **Users** section
4. Verify that a corresponding record is created in the **users** table

## Step 8: Production Deployment

When deploying to production:

1. Update your environment variables in your hosting platform
2. Update the **Site URL** and **Redirect URLs** in Supabase Auth settings
3. Update the `VITE_BASE_URL` to point to your production backend

## Troubleshooting

### Common Issues:

1. **"Invalid JWT"**: Check that your JWT secret is correct
2. **"Row Level Security policy violation"**: Ensure RLS policies are set up correctly
3. **"relation does not exist"**: Make sure you've run the database migration
4. **CORS errors**: Check your site URL configuration in Supabase

### Getting Help:

- Check the [Supabase Documentation](https://supabase.com/docs)
- Join the [Supabase Discord](https://discord.supabase.com/)
- Review the application logs for specific error messages

## Security Notes

- Never commit your service role key to version control
- Use environment variables for all sensitive data
- Regularly rotate your API keys
- Monitor your Supabase usage and set up billing alerts
- Review and test your RLS policies regularly

## Next Steps

Once connected, you can:
- Customize the database schema as needed
- Add more authentication providers
- Set up real-time subscriptions
- Configure edge functions for advanced features
- Set up monitoring and analytics