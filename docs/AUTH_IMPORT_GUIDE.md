# Auth System Import Guide

## 📦 Two Separate Files

### 1. `lib/auth.ts` - Server-Side & Shared Functions
**Use in:** API routes, server components, middleware

```typescript
import { auth, getCurrentUser, signIn, signOut, validateAuthentication } from '@/lib/auth'
```

**Available functions:**
- `getCurrentUser()` - Get current authenticated user
- `signIn(email, password)` - Sign in user
- `signUp(email, password, name)` - Sign up new user  
- `signOut()` - Sign out user
- `validateAuthentication()` - Check if user is authenticated
- `auth.getSession()` - Get current session
- `auth.requireAuth()` - Require authentication (throws error if not authenticated)

### 2. `lib/auth-hooks.ts` - Client-Side React Hooks
**Use in:** Client components (pages with 'use client')

```typescript
import { useAuth } from '@/lib/auth-hooks'
```

**Available hooks:**
- `useAuth()` - React hook for authentication state
  - Returns: `{ user, isLoading, isAuthenticated, signIn, signUp, signOut }`

---

## ✅ Usage Examples

### API Route (Server-Side)
```typescript
// app/api/some-route/route.ts
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  
  return NextResponse.json({ userId: user.id })
}
```

### Client Component
```typescript
// app/some-page/page.tsx
'use client'

import { useAuth } from '@/lib/auth-hooks'

export default function SomePage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please login</div>
  
  return <div>Welcome {user?.email}</div>
}
```

### Server Component
```typescript
// app/some-page/page.tsx
import { auth } from '@/lib/auth'

export default async function SomePage() {
  const { user } = await auth.getSession()
  
  return <div>User: {user?.email || 'Not logged in'}</div>
}
```

---

## 🚨 Common Mistakes

### ❌ Don't do this in API routes:
```typescript
import { useAuth } from '@/lib/auth-hooks' // ERROR! This is for client components only
```

### ❌ Don't do this in client components:
```typescript
import { getCurrentUser } from '@/lib/auth'

// Then try to call it directly without 'use client'
const user = await getCurrentUser() // ERROR! Server function in client component
```

### ✅ Do this instead:
```typescript
'use client'
import { useAuth } from '@/lib/auth-hooks'

export default function MyComponent() {
  const { user } = useAuth() // ✅ Correct!
  return <div>{user?.email}</div>
}
```

---

## 📝 Migration Guide

If you were using `useAuth` from `lib/auth.ts` before:

**Old:**
```typescript
import { useAuth } from '@/lib/auth'
```

**New:**
```typescript
import { useAuth } from '@/lib/auth-hooks'
```

Everything else stays the same!
