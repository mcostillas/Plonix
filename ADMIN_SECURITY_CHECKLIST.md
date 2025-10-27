# 🔐 Admin Security Setup Checklist

## ✅ Immediate Actions Required

### 1. Environment Variable (OPTIONAL)
- [ ] Open `.env.local` file in your project root
- [ ] Add this line (optional - defaults to 'admin'):
  ```
  ADMIN_USERNAME_WHITELIST=admin
  ```
- [ ] Save the file
- [ ] Restart your development server

**Note**: Admin uses separate username/password authentication (username: `admin`, password: `admin123`), NOT regular user accounts.

### 2. Database Setup (CRITICAL)
- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Copy contents of `scripts/setup-admin-security.sql`
- [ ] Paste and run the SQL script
- [ ] Verify your admin account in `admin_credentials` table has `is_active=true`

**Note**: Admin login uses the `admin_credentials` table with username/password, not the regular `user_profiles` table.

### 3. Update Your Middleware (OPTIONAL but RECOMMENDED)
- [ ] Open `middleware.ts`
- [ ] Add this code:
  ```typescript
  import { adminMiddleware } from '@/lib/admin-middleware'
  
  export async function middleware(request: NextRequest) {
    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      return await adminMiddleware(request)
    }
    
    return NextResponse.next()
  }
  
  export const config = {
    matcher: ['/admin/:path*'],
  }
  ```

### 4. Update Admin API Routes
- [ ] Review all files in `app/api/admin/`
- [ ] Update each to use new `requireAdmin()` pattern:
  ```typescript
  import { requireAdmin } from '@/lib/admin-middleware'
  
  export async function GET(request: NextRequest) {
    const auth = await requireAdmin(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 403 })
    }
    // ... your code
  }
  ```

---

## 🧪 Testing Steps

### Test 1: Environment Variable (Optional)
- [ ] Run this in your terminal:
  ```powershell
  node -e "require('dotenv').config({ path: '.env.local' }); console.log(process.env.ADMIN_USERNAME_WHITELIST || 'admin (default)')"
  ```
- [ ] Should output: `admin` (or your custom whitelist)

### Test 2: Database Admin Credentials
- [ ] In Supabase SQL Editor, run:
  ```sql
  SELECT username, email, is_active, last_login FROM admin_credentials WHERE username = 'admin';
  ```
- [ ] Should show `is_active=true`

### Test 3: Admin Login
- [ ] Go to your admin login page
- [ ] Enter username: `admin`
- [ ] Enter password: `admin123`
- [ ] Should successfully login and redirect to `/admin` dashboard

### Test 4: Non-Admin Access
- [ ] Try to access `/admin` page without logging in as admin
- [ ] Should be redirected to login or see "Unauthorized"

### Test 5: Wrong Credentials
- [ ] Try logging in with wrong username or password
- [ ] Should see "Invalid credentials" error
- [ ] After 5 failed attempts, should be rate-limited

### Test 6: API Protection
- [ ] Open browser DevTools → Network tab
- [ ] Login as admin
- [ ] Go to admin page that calls API (e.g., stats)
- [ ] Should see 200 OK responses
- [ ] Logout and try again
- [ ] Should see 403 Forbidden responses

---

## 📋 Files Changed

### Modified:
1. ✅ `lib/admin-auth.ts` - Enhanced with 4-layer security
2. ✅ `app/api/admin/stats/route.ts` - Example of new pattern

### Created:
1. ✅ `lib/admin-middleware.ts` - Middleware and API guards
2. ✅ `docs/ADMIN_SECURITY_GUIDE.md` - Complete documentation
3. ✅ `docs/ADMIN_SECURITY_IMPLEMENTATION_SUMMARY.md` - Quick summary
4. ✅ `scripts/setup-admin-security.sql` - Database setup script

---

## 🎯 Quick Start (30 seconds)

1. **Add to `.env.local` (OPTIONAL - defaults to 'admin'):**
   ```
   ADMIN_USERNAME_WHITELIST=admin
   ```

2. **Run in Supabase SQL Editor:**
   ```sql
   UPDATE admin_credentials SET is_active=true WHERE username='admin';
   ```

3. **Restart dev server:**
   ```powershell
   npm run dev
   ```

4. **Test admin login:**
   - Go to admin login page
   - Username: `admin`
   - Password: `admin123`
   - Should redirect to `/admin` ✨

---

## 🔒 Security Layers Explained

Your admin now requires:
1. ✅ Username in `ADMIN_USERNAME_WHITELIST` (defaults to 'admin')
2. ✅ Valid password in `admin_credentials` table (bcrypt hashed)
3. ✅ `is_active=true` in admin_credentials table

**All 3 must pass or access is denied.**

**Note**: Admin system is completely separate from regular user authentication. Admin uses username/password from `admin_credentials` table, not user emails.

---

## 🚨 Troubleshooting

### "Access denied: Username not in ADMIN_USERNAME_WHITELIST"
→ Check `.env.local` has `ADMIN_USERNAME_WHITELIST=admin`
→ Or remove the environment variable to use default 'admin'
→ Restart dev server after changing .env files

### "Access denied: Admin credentials not found in database"
→ Verify admin account exists: `SELECT * FROM admin_credentials WHERE username='admin';`

### "Access denied: Admin account is disabled"
→ Run SQL: `UPDATE admin_credentials SET is_active=true WHERE username='admin';`

### "Invalid credentials"
→ Verify username is exactly `admin` (lowercase)
→ Verify password is `admin123`
→ Check password hasn't been changed in database

---

## 📖 Documentation

- **Full Setup Guide**: `docs/ADMIN_SECURITY_GUIDE.md`
- **Implementation Summary**: `docs/ADMIN_SECURITY_IMPLEMENTATION_SUMMARY.md`
- **SQL Setup Script**: `scripts/setup-admin-security.sql`

---

## ✨ You're All Set!

Once you complete the checklist above, your admin authentication will be secured with multi-layer protection! 🎉
