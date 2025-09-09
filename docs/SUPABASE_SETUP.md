# 🔧 **Plounix Supabase Setup Guide**

This guide will help you set up Supabase authentication and database for your Plounix application.

## 📋 **Quick Setup Checklist**

- [ ] Create Supabase account and project
- [ ] Get API keys from dashboard
- [ ] Update `.env.local` file
- [ ] Run database schema setup
- [ ] Test authentication flow

---

## 🚀 **Step 1: Create Supabase Project**

1. **Go to Supabase Dashboard**
   - Visit: [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sign up or log in to your account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Fill in project details:
     - **Name**: `plounix-app` (or your preferred name)
     - **Database Password**: Create a strong password (save this!)
     - **Region**: Choose closest to your location
   - Click "Create new project"
   - Wait for project setup (2-3 minutes)

---

## 🔑 **Step 2: Get Your API Keys**

1. **Navigate to Settings**
   - In your project dashboard, go to **Settings** > **API**

2. **Copy Required Keys**
   ```bash
   # Project URL (something like)
   https://abcdefghijklmnop.supabase.co
   
   # anon/public key (starts with eyJ...)
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # service_role key (starts with eyJ... - keep this secret!)
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 📝 **Step 3: Update Environment Variables**

1. **Open your `.env.local` file** (in project root)

2. **Replace placeholder values** with your actual Supabase credentials:
   ```env
   # Replace with your actual Supabase URL
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   
   # Replace with your actual anon key  
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   
   # Replace with your actual service role key (keep secret!)
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Save the file** and restart your development server

---

## 🗄️ **Step 4: Set Up Database Schema**

1. **Go to Supabase SQL Editor**
   - In your project dashboard: **SQL Editor** > **New query**

2. **Run the Setup Script**
   - Copy the entire contents of `docs/supabase-auth-setup.sql`
   - Paste into the SQL editor
   - Click **Run** button
   - ✅ You should see "Plounix authentication and profile setup complete!" message

3. **Verify Tables Created**
   - Go to **Table Editor** in dashboard
   - You should see these tables:
     - `profiles` - User profile information
     - `user_profiles` - Financial data and AI insights
     - `chat_history` - Conversation history for AI memory
     - `financial_memories` - Vector storage for AI learning

---

## 🔐 **Step 5: Test Authentication**

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test Registration**
   - Go to: http://localhost:3001/auth/register
   - Create a test account
   - Check your email for verification link

3. **Test Login**
   - Go to: http://localhost:3001/auth/login
   - Login with your test account
   - Verify you can access AI assistant with memory

4. **Check Database**
   - In Supabase dashboard > **Table Editor** > `profiles`
   - You should see your new user profile created automatically

---

## 🎯 **Step 6: Enable Row Level Security (Already Done)**

Our SQL script automatically enables RLS policies for:
- ✅ Users can only access their own data
- ✅ Authentication required for all operations
- ✅ Automatic profile creation on signup
- ✅ Vector search permissions for AI memory

---

## 🧪 **Testing Your Setup**

### Test Authentication Flow:
```bash
# 1. Register new user
http://localhost:3001/auth/register

# 2. Check email for verification
# 3. Login with verified account
http://localhost:3001/auth/login

# 4. Access AI assistant (should show personalized memory)
http://localhost:3001/ai-assistant
```

### Verify Database Tables:
1. **Supabase Dashboard** > **Table Editor**
2. Check data in `profiles` and `user_profiles` tables
3. Test chat in AI assistant
4. Verify `chat_history` table gets populated

---

## 🔧 **Advanced Configuration**

### Email Templates (Optional)
1. **Supabase Dashboard** > **Authentication** > **Email Templates**
2. Customize signup confirmation and password reset emails
3. Add your app branding and Filipino localization

### Domain Configuration (For Production)
1. **Authentication** > **URL Configuration**
2. Add your production domain
3. Set redirect URLs for email confirmations

### Storage Setup (For Profile Pictures)
1. **Storage** > **Create Bucket**
2. Name: `avatars`
3. Enable public access for profile pictures
4. Set up RLS policies for user uploads

---

## ❗ **Troubleshooting**

### Common Issues:

**"Invalid API Key" Error:**
- Double-check your `.env.local` file
- Ensure no extra spaces in environment variables
- Restart your development server

**"Table doesn't exist" Error:**
- Run the SQL setup script again
- Check if all tables were created in Table Editor
- Verify you're using the correct database

**Email Not Sending:**
- Check spam folder
- Supabase free tier has email limits
- Configure custom SMTP in production

**Authentication Not Working:**
- Clear browser cookies and localStorage
- Check browser console for errors
- Verify environment variables are loaded

---

## 📞 **Need Help?**

1. **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
2. **Next.js Auth Guide**: [https://supabase.com/docs/guides/auth/auth-helpers/nextjs](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
3. **Plounix GitHub Issues**: [Create an issue if you need help]

---

## 🎉 **Success!**

Once completed, your Plounix app will have:
- ✅ Secure user authentication
- ✅ Personalized AI memory system
- ✅ User profile management
- ✅ Protected financial data
- ✅ Real-time auth state updates

Your users can now:
- 📝 Register and verify accounts
- 🔐 Securely login/logout
- 🤖 Chat with AI that remembers their context
- 💰 Store personalized financial data
- 🎯 Track learning progress and goals

**Ready to help Filipinos master their finances! 🇵🇭💪**
