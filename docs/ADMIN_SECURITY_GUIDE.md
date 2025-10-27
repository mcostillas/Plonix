# Admin Authentication Security Guide

## 🔒 Multi-Layer Security Implementation

Your admin authentication now has **4 layers of security**:

### Layer 1: Environment Variable Whitelist
- Only emails in `ADMIN_EMAIL_WHITELIST` can access admin features
- **Required:** Add to `.env.local`

```env
ADMIN_EMAIL_WHITELIST=costillasmarcmaurice@gmail.com,admin@plounix.com
```

### Layer 2: Email Verification
- Admin must have verified email in Supabase Auth
- Prevents unauthorized access even if someone gets credentials

### Layer 3: Database Role Check
- User must have `role='admin'` OR `is_admin=true` in `user_profiles` table
- Adds database-level permission control

### Layer 4: Admin Credentials Table
- Traditional username/password in `admin_credentials` table
- Passwords hashed with bcrypt
- `is_active` field allows disabling admin accounts

---

## 📋 Setup Checklist

### 1. Environment Variables
Add to your `.env.local`:

```env
# Admin email whitelist (comma-separated)
ADMIN_EMAIL_WHITELIST=costillasmarcmaurice@gmail.com

# Your existing Supabase vars
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Updates

#### Add columns to `user_profiles` table:
```sql
-- Add admin role columns if they don't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Set your account as admin
UPDATE user_profiles 
SET role = 'admin', is_admin = true 
WHERE email = 'costillasmarcmaurice@gmail.com';
```

#### Ensure `admin_credentials` table has `is_active`:
```sql
-- Add is_active column if it doesn't exist
ALTER TABLE admin_credentials 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Make sure your admin account is active
UPDATE admin_credentials 
SET is_active = true 
WHERE email = 'costillasmarcmaurice@gmail.com';
```

### 3. Protect Admin API Routes

Update your admin API routes to use the new security:

```typescript
// Example: app/api/admin/users/route.ts
import { requireAdmin } from '@/lib/admin-middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Check admin authorization
  const auth = await requireAdmin(request)
  
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: 403 }
    )
  }

  // Admin is authorized, proceed with operation
  // ... your admin logic here
}
```

### 4. Protect Admin Pages (Middleware)

Update `middleware.ts` to protect `/admin/*` routes:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminMiddleware } from '@/lib/admin-middleware'

export async function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return await adminMiddleware(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    // ... other protected routes
  ],
}
```

---

## 🔐 Security Features

### ✅ What's Protected:

1. **Email Whitelist**: Hardcoded list prevents unauthorized access
2. **Email Verification**: Must verify email through Supabase
3. **Database Roles**: Double-check with `user_profiles` table
4. **Active Status**: Can disable admin accounts without deleting
5. **Session Expiry**: 24-hour session timeout
6. **Rate Limiting**: Built-in protection against brute force (5 attempts per 15 min)
7. **Audit Logging**: All admin actions are logged
8. **Secure Cookies**: httpOnly, sameSite, secure in production

### 🛡️ Attack Mitigation:

- **SQL Injection**: Protected by Supabase parameterized queries
- **Brute Force**: Rate limiting on login attempts
- **Session Hijacking**: httpOnly cookies, short expiry
- **Privilege Escalation**: Multi-layer verification prevents bypass
- **Unauthorized Access**: Must pass ALL 4 security layers

---

## 📊 Usage Examples

### Check Admin Access Programmatically
```typescript
import { verifyAdminAccess } from '@/lib/admin-auth'

// Get detailed verification report
const verification = await verifyAdminAccess(
  'user@example.com',
  'user-id-123' // optional
)

if (verification.isAdmin) {
  console.log('✅ Admin access granted')
} else {
  console.log('❌ Access denied:', verification.reasons)
}
```

### Protect Server Actions
```typescript
'use server'

import { verifyAdminAccess, getAdminSession } from '@/lib/admin-auth'

export async function deleteUser(userId: string) {
  const session = await getAdminSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }

  const verification = await verifyAdminAccess(session.email)
  
  if (!verification.isAdmin) {
    throw new Error('Access denied: ' + verification.reasons.join(', '))
  }

  // Proceed with deletion
  // ...
}
```

---

## 🚨 Important Security Notes

### DO:
- ✅ Always use `requireAdmin()` in API routes
- ✅ Keep `ADMIN_EMAIL_WHITELIST` in environment variables (not code)
- ✅ Use `verifyAdminAccess()` for critical operations
- ✅ Review admin activity logs regularly
- ✅ Disable admin accounts instead of deleting (set `is_active=false`)

### DON'T:
- ❌ Don't hardcode admin emails in code
- ❌ Don't skip verification layers for "convenience"
- ❌ Don't share admin credentials
- ❌ Don't reuse admin passwords from other services
- ❌ Don't expose admin API endpoints publicly

---

## 🔧 Testing Your Setup

### Test 1: Email Whitelist
```typescript
// Should work
await verifyAdminAccess('costillasmarcmaurice@gmail.com')

// Should fail
await verifyAdminAccess('random@email.com')
```

### Test 2: Database Roles
```sql
-- Check your admin status
SELECT email, role, is_admin 
FROM user_profiles 
WHERE email = 'costillasmarcmaurice@gmail.com';
```

### Test 3: Admin Credentials
```sql
-- Verify admin credentials are active
SELECT username, email, is_active, last_login 
FROM admin_credentials 
WHERE email = 'costillasmarcmaurice@gmail.com';
```

---

## 🎯 Quick Start

1. **Add environment variable:**
   ```
   ADMIN_EMAIL_WHITELIST=costillasmarcmaurice@gmail.com
   ```

2. **Update database:**
   ```sql
   UPDATE user_profiles SET role='admin', is_admin=true WHERE email='costillasmarcmaurice@gmail.com';
   UPDATE admin_credentials SET is_active=true WHERE email='costillasmarcmaurice@gmail.com';
   ```

3. **Use in API routes:**
   ```typescript
   import { requireAdmin } from '@/lib/admin-middleware'
   
   const auth = await requireAdmin(request)
   if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 403 })
   ```

4. **Done!** Your admin authentication is now secured with 4 layers of protection.

---

## 📞 Need Help?

If you encounter any issues:
1. Check environment variables are set correctly
2. Verify database columns exist
3. Ensure email is verified in Supabase Auth
4. Review console logs for specific error messages

The `verifyAdminAccess()` function returns detailed `reasons` array explaining why access was denied.
