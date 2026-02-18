# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or use existing one: `rtcfihfvzhslczfolenu`

## 2. Run Database Schema

1. Navigate to SQL Editor in Supabase Dashboard
2. Copy the contents of `schema.sql`
3. Paste and run the SQL script

This will create:
- `projects` table - Store project metadata
- `endpoints` table - Configure API endpoints per sheet
- `project_auth` table - API authentication settings
- Indexes for performance
- Row Level Security (RLS) policies

## 3. Configure Google OAuth

1. Go to Authentication > Providers in Supabase Dashboard
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID: `your_google_client_id`
   - Client Secret: `your_google_client_secret`
4. Add required scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`

## 4. Update Redirect URLs

Add these URLs to your Google OAuth consent screen:
- Development: `http://localhost:3000/auth/callback`
- Production: `https://your-domain.vercel.app/auth/callback`

## 5. Environment Variables

Ensure `.env.local` has the correct values:
```
NEXT_PUBLIC_SUPABASE_URL=https://rtcfihfvzhslczfolenu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 6. Test Database Connection

Run the app and check if you can connect to Supabase without errors.
