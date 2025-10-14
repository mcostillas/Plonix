# Admin Setup Quick Test

## ⚠️ CRITICAL: Have you run the SQL file yet?

**YOU MUST DO THIS FIRST before admin login will work!**

### Step 1: Run SQL in Supabase (5 minutes)

1. Go to: https://supabase.com/dashboard/project/_/sql/new
2. Copy ALL content from: `docs/admin-dashboard-schema.sql`
3. Paste into SQL Editor
4. Click **RUN** button
5. Wait for "Success" message

### Step 2: Add Service Role Key to .env.local

Add this line to your `.env.local` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to find it:**
- Supabase Dashboard → Settings → API
- Find "service_role" (secret) key
- Copy and paste above

### Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Test Admin Login

1. Go to: http://localhost:3000/auth/login
2. Enter:
   - **Email/Username:** `admin`
   - **Password:** `admin123`
3. Click "Log In to Plounix"
4. Should redirect to: http://localhost:3000/admin

---

## 🔍 Troubleshooting

### "Invalid credentials" error?
- ✅ Make sure SQL was run in Supabase
- ✅ Check `admin_credentials` table exists
- ✅ Verify username is exactly `admin` (lowercase)

### "Network error" or "500 error"?
- ✅ Check `SUPABASE_SERVICE_ROLE_KEY` is in `.env.local`
- ✅ Restart dev server after adding env variable

### Still not working?
- Run this SQL in Supabase to verify admin exists:
  ```sql
  SELECT username, email, is_active FROM admin_credentials;
  ```
- Should show: `admin | admin@plounix.com | true`

---

## ✅ Checklist

- [ ] Ran SQL file in Supabase (created tables)
- [ ] Added SUPABASE_SERVICE_ROLE_KEY to .env.local
- [ ] Restarted dev server
- [ ] Tried login with `admin` / `admin123`

---

**Once you complete these steps, the admin login will work!**
