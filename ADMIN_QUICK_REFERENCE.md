# 🔐 Admin Security - Quick Reference

## 🎯 Key Points

### Admin vs User Authentication
- **Admin**: Username/password (`admin`/`admin123`) in `admin_credentials` table
- **Users**: Email/password for app users in Supabase Auth
- **Completely separate systems** - your user account is NOT the admin

### Admin Login Credentials
```
Username: admin
Password: PlounixAdmin2025!Secure#
```

**Note**: This is a secure password with 26 characters including uppercase, lowercase, numbers, and special characters.

## 🛡️ Security Layers

### 1. Username Whitelist (Optional)
- Environment variable: `ADMIN_USERNAME_WHITELIST=admin`
- Defaults to 'admin' if not set
- Only whitelisted usernames can access admin

### 2. Password Verification
- Bcrypt hashed password in `admin_credentials` table
- Must match stored hash to login

### 3. Active Status
- `is_active` column in `admin_credentials` table
- Must be `true` to access admin features

## 📋 Quick Setup

### 1. Database (REQUIRED)
```sql
-- Ensure is_active column exists and is true
ALTER TABLE admin_credentials ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
UPDATE admin_credentials SET is_active = true WHERE username = 'admin';
```

### 2. Environment Variable (OPTIONAL)
```env
# Add to .env.local (optional - defaults to 'admin')
ADMIN_USERNAME_WHITELIST=admin
```

### 3. Test Login
- Go to admin login page
- Username: `admin`
- Password: `PlounixAdmin2025!Secure#`
- Should redirect to `/admin` dashboard

## 🔧 Usage in Code

### Protect API Routes
```typescript
import { requireAdmin } from '@/lib/admin-middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 })
  }

  // Your admin logic here...
}
```

### Protect Pages (middleware.ts)
```typescript
import { adminMiddleware } from '@/lib/admin-middleware'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return await adminMiddleware(request)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

### Check Admin in Server Actions
```typescript
import { getAdminSession, verifyAdminAccess } from '@/lib/admin-auth'

const session = await getAdminSession()
if (!session) throw new Error('Not authenticated')

const verification = await verifyAdminAccess(session.username)
if (!verification.isAdmin) {
  throw new Error('Access denied')
}
```

## 🚨 Common Issues

### Can't login as admin
✅ Verify credentials: username=`admin`, password=`PlounixAdmin2025!Secure#`
✅ Check database: `SELECT * FROM admin_credentials WHERE username='admin'`
✅ Ensure `is_active=true`

### "Access denied" after login
✅ Check `ADMIN_USERNAME_WHITELIST` includes 'admin' (or remove env var)
✅ Verify session cookie is set (check browser DevTools)
✅ Check console logs for detailed error reasons

### Rate limited
✅ Wait 15 minutes after 5 failed login attempts
✅ Or restart your dev server to clear rate limit cache

## 📊 Security Features

- ✅ **Username whitelist**: Only approved usernames
- ✅ **Bcrypt passwords**: Industry-standard hashing
- ✅ **Active status**: Can disable accounts
- ✅ **Rate limiting**: 5 attempts per 15 minutes
- ✅ **Session expiry**: 24-hour timeout
- ✅ **httpOnly cookies**: JavaScript cannot access
- ✅ **Audit logging**: All actions tracked

## 🎯 Remember

1. Admin login is **NOT** your user account (costillasmarcmaurice@gmail.com)
2. Use username `admin` and password `admin123` to access admin features
3. Admin system is completely separate from regular user authentication
4. All admin actions are logged for security audit

---

**Quick Test**: 
1. Go to admin login
2. Enter: username=`admin`, password=`PlounixAdmin2025!Secure#`
3. Should see admin dashboard ✅

---

**Important**: Run `scripts/update-admin-password.sql` in Supabase to activate the new secure password!
