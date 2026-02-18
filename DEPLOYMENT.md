# Deployment Guide for SheetAPI

This guide will walk you through deploying SheetAPI to Vercel.

## Prerequisites

- A Vercel account (free tier works)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Supabase project already set up
- Google OAuth credentials already configured

## Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"

2. **Import Repository**
   - Connect your Git provider
   - Select your SheetAPI repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Add Environment Variables**
   Click "Environment Variables" and add:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://rtcfihfvzhslczfolenu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Post-Deployment Configuration

### 1. Update Supabase Redirect URLs

Go to Supabase Dashboard:
- Navigate to Authentication > URL Configuration
- Add your Vercel domain to "Site URL"
- Add to "Redirect URLs":
  ```
  https://your-domain.vercel.app/auth/callback
  https://your-domain.vercel.app/**
  ```

### 2. Update Google OAuth Redirect URIs

Go to Google Cloud Console:
- Navigate to APIs & Services > Credentials
- Click your OAuth 2.0 Client ID
- Add to "Authorized redirect URIs":
  ```
  https://your-domain.vercel.app/auth/callback
  ```
- Save changes

### 3. Test Your Deployment

1. Visit your Vercel domain: `https://your-domain.vercel.app`
2. Click "Get Started"
3. Sign in with Google
4. Create a test project
5. Test API endpoints

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | https://xxx.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | eyJhbGc... |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (keep secret!) | eyJhbGc... |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | xxx.apps.googleusercontent.com |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | GOCSPX-xxx |

## Custom Domain (Optional)

1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Update redirect URLs in Supabase and Google Console

## Continuous Deployment

Vercel automatically deploys when you push to your Git repository:

- **Main branch**: Deploys to production
- **Other branches**: Creates preview deployments

## Monitoring and Logs

- **Dashboard**: View deployment status and analytics
- **Logs**: Check runtime logs in Vercel Dashboard > Deployments > [Your Deployment] > Logs
- **Analytics**: Monitor performance in Vercel Analytics

## Rollback

If something goes wrong:

1. Go to Vercel Dashboard > Deployments
2. Find a previous working deployment
3. Click "..." > "Promote to Production"

## Performance Optimization

- **Edge Functions**: Already optimized by Vercel
- **Caching**: API routes are cached automatically
- **Static Assets**: Automatically served via CDN

## Troubleshooting

### Build Fails

- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors locally

### Environment Variables Not Working

- Make sure variables are added to all environments (Production, Preview, Development)
- Redeploy after adding environment variables

### OAuth Not Working

- Verify redirect URLs match exactly (including https://)
- Check that environment variables are correctly set
- Ensure Google OAuth consent screen is published

### API Errors

- Check Function Logs in Vercel Dashboard
- Verify Supabase connection is working
- Ensure Google Sheets API is enabled

## Security Best Practices

1. **Never commit `.env.local`** to Git
2. **Use Vercel's secret management** for sensitive variables
3. **Enable Supabase RLS policies** (already configured)
4. **Monitor API usage** in Vercel Analytics
5. **Set up alerts** for unusual activity

## Support

If you encounter issues:
- Check Vercel Status: [vercel-status.com](https://vercel-status.com)
- Review Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Check Supabase Status: [status.supabase.com](https://status.supabase.com)
