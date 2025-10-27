# Google OAuth Setup Guide for Plounix

This guide will walk you through setting up Google OAuth authentication for your Plounix application.

## Overview

Google OAuth allows users to sign in or sign up using their Google account, providing a seamless authentication experience without needing to create a new password.

## Prerequisites

- A Supabase project (you should already have this)
- A Google Cloud Platform account
- Your application deployed or running locally

## Step 1: Configure Google Cloud Platform

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `Plounix` (or your preferred name)
4. Click "Create"

### 1.2 Enable Google+ API

1. In your Google Cloud Project, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and click "Enable"

### 1.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required information:
   - **App name**: Plounix
   - **User support email**: Your email
   - **Developer contact email**: Your email
   - **App logo** (optional): Upload your Plounix logo
5. Click "Save and Continue"
6. **Scopes**: Click "Add or Remove Scopes"
   - Add: `userinfo.email`
   - Add: `userinfo.profile`
   - Click "Update" then "Save and Continue"
7. **Test users** (for development):
   - Add your email and any test user emails
   - Click "Save and Continue"
8. Review and click "Back to Dashboard"

### 1.4 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "OAuth client ID"
3. Select **Application type**: Web application
4. **Name**: Plounix Web Client
5. **Authorized JavaScript origins**:
   - For local development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
6. **Authorized redirect URIs** - This is CRITICAL:
   - Get your Supabase project URL from Supabase Dashboard
   - Add: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Example: `https://abcdefghijk.supabase.co/auth/v1/callback`
7. Click "Create"
8. **Important**: Copy your **Client ID** and **Client Secret** - you'll need these!

## Step 2: Configure Supabase

### 2.1 Add Google Provider to Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your Plounix project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list
5. Toggle it to **Enabled**
6. Enter your Google OAuth credentials:
   - **Client ID**: (paste from Google Cloud Console)
   - **Client Secret**: (paste from Google Cloud Console)
7. Click "Save"

### 2.2 Configure Redirect URLs in Supabase

1. Still in **Authentication** → **URL Configuration**
2. Add your site URL:
   - For local: `http://localhost:3000`
   - For production: `https://yourdomain.com`
3. Add redirect URLs (comma-separated if multiple):
   - `http://localhost:3000/auth/callback` (for local)
   - `https://yourdomain.com/auth/callback` (for production)

## Step 3: Environment Variables

Your existing `.env.local` should already have:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

No additional environment variables are needed for Google OAuth since Supabase handles the credentials.

## Step 4: Test the Integration

### Local Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000/auth/login`

3. Click "Sign in with Google"

4. You should be redirected to Google's OAuth consent screen

5. After authorizing, you'll be redirected back to `/auth/callback` and then to `/dashboard`

### Production Testing

1. Deploy your application to Vercel (or your hosting platform)

2. Make sure your production URL is added to:
   - Google Cloud Console (Authorized JavaScript origins & redirect URIs)
   - Supabase (Site URL & Redirect URLs)

3. Test the login flow on your production site

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Solution**: The redirect URI in your Google Cloud Console doesn't match what Supabase is sending.

1. Check your Supabase project URL
2. Ensure the redirect URI is: `https://your-project-ref.supabase.co/auth/v1/callback`
3. No trailing slashes!

### Error: "Access blocked: This app's request is invalid"

**Solution**: Your OAuth consent screen is not configured properly.

1. Go back to Google Cloud Console → OAuth consent screen
2. Make sure all required fields are filled
3. Add your email as a test user if the app is in "Testing" mode

### Users are redirected but not logged in

**Solution**: Check your callback page implementation.

1. Ensure `/app/auth/callback/page.tsx` exists
2. Check browser console for errors
3. Verify Supabase session is being set properly

### "User already exists" error

This is normal! If a user signs up with email/password first, then tries to use Google OAuth with the same email, Supabase will link the accounts automatically (if configured to do so).

## Security Best Practices

1. **Never commit OAuth secrets**: Keep your Client Secret in Supabase only
2. **Use HTTPS in production**: Google OAuth requires HTTPS for production apps
3. **Verify email domains**: Consider restricting OAuth to specific email domains if needed
4. **Monitor OAuth usage**: Check Google Cloud Console for API usage and quota

## Features Implemented

✅ **Sign In with Google** on login page  
✅ **Sign Up with Google** on register page  
✅ **Automatic profile creation** for new Google users  
✅ **Email verification bypass** (Google emails are pre-verified)  
✅ **Welcome email** sent to new Google sign-ups  
✅ **Freemium membership** assigned to all new users  
✅ **Seamless redirect** to dashboard after authentication  

## User Flow

1. User clicks "Sign in/up with Google"
2. Redirected to Google OAuth consent screen
3. User authorizes Plounix
4. Google redirects to: `https://your-project.supabase.co/auth/v1/callback`
5. Supabase processes the OAuth response
6. User is redirected to: `https://yourdomain.com/auth/callback`
7. Callback page creates/updates user profile
8. User is redirected to: `/dashboard`

## Need Help?

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- Check Supabase logs in Dashboard → Logs → Auth
- Check browser console for client-side errors

---

**Last Updated**: October 27, 2025  
**Plounix Version**: 0.1.0
