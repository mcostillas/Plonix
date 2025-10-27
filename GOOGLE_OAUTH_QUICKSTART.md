# Google OAuth Quick Start

## ⚡ Quick Setup (5 minutes)

### 1. Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. **APIs & Services** → **OAuth consent screen**
   - Choose "External"
   - Fill in app name and emails
   - Add scopes: `userinfo.email`, `userinfo.profile`
4. **Credentials** → **Create Credentials** → **OAuth client ID**
   - Type: Web application
   - Authorized redirect URI: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
   - Save the **Client ID** and **Client Secret**

### 2. Supabase Dashboard

1. Go to https://app.supabase.com/
2. Select your project
3. **Authentication** → **Providers** → **Google**
4. Toggle **Enabled**
5. Paste your **Client ID** and **Client Secret**
6. Save

### 3. Test It!

1. Run `npm run dev`
2. Go to http://localhost:3000/auth/login
3. Click "Sign in with Google"
4. ✅ Done!

## 🔧 Quick Troubleshooting

**redirect_uri_mismatch error?**
- Check your Supabase project URL
- Ensure redirect URI is: `https://YOUR_PROJECT.supabase.co/auth/v1/callback` (no trailing slash)

**Not redirecting after Google login?**
- Make sure `/app/auth/callback/page.tsx` exists (it should be created already)
- Check browser console for errors

## 📝 What Was Added

Files created/modified:
- ✅ `lib/auth.ts` - Added `signInWithGoogle()` function
- ✅ `app/auth/login/page.tsx` - Added Google Sign In button
- ✅ `app/auth/register/page.tsx` - Added Google Sign Up button
- ✅ `app/auth/callback/page.tsx` - Handles OAuth redirect

## 🎯 Next Steps

1. Set up Google Cloud credentials (see above)
2. Configure Supabase (see above)
3. Test locally
4. Before production deployment:
   - Add production URL to Google Cloud authorized origins
   - Add production redirect URI to Google Cloud
   - Update Supabase site URL

For detailed instructions, see `docs/GOOGLE_OAUTH_SETUP.md`
