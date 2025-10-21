# Loading Components Guide

## Unified Plounix Spinner System

We use **ONE single Spinner component** across the entire app for all loading states.

### The Plounix Spinner ✅

**Component:** `Spinner` from `@/components/ui/spinner`

**Import:**
```tsx
import { Spinner } from '@/components/ui/spinner'
```

**Features:**
- ✅ Clean, minimal design
- ✅ Circular border-based spinner
- ✅ 5 size options
- ✅ 3 color options
- ✅ No text or labels - spinner only
- ✅ Used everywhere consistently

---

## Usage Examples

### Full Page Loading

```tsx
import { Spinner } from '@/components/ui/spinner'

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Spinner size="xl" color="primary" />
    </div>
  )
}
```

### Button Loading

```tsx
import { Spinner } from '@/components/ui/spinner'

<Button disabled={loading}>
  {loading && <Spinner size="sm" className="mr-2" />}
  Save Changes
</Button>
```

### Inline/Section Loading

```tsx
import { Spinner } from '@/components/ui/spinner'

<div className="p-8 text-center">
  <Spinner size="lg" color="primary" className="mx-auto" />
</div>
```

### Multiple Sizes Example

```tsx
import { Spinner } from '@/components/ui/spinner'

export function SpinnerSize() {
  return (
    <div className="flex items-center gap-6">
      <Spinner className="size-3" />
      <Spinner className="size-4" />
      <Spinner className="size-6" />
      <Spinner className="size-8" />
    </div>
  )
}
```

---

## Spinner Props

```tsx
interface SpinnerProps {
  className?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  color?: "primary" | "white" | "current"
}
```

### Size Options
- `xs`: 12px (h-3 w-3) - For tiny indicators
- `sm`: 16px (h-4 w-4) - For buttons
- `md`: 24px (h-6 w-6) - Default inline
- `lg`: 32px (h-8 w-8) - For sections
- `xl`: 48px (h-12 w-12) - For full pages

### Color Options
- `primary`: Green brand color
- `white`: White (for dark backgrounds)
- `current`: Inherits text color

---

## Helper Components

### PageLoader

Convenience wrapper for full-page loading. Uses Spinner internally.

```tsx
import { PageLoader } from '@/components/ui/page-loader'

if (loading) {
  return <PageLoader />
}
```

**Note:** Message prop is ignored (no text shown).

### PageSpinner

Identical to PageLoader. Use either one.

```tsx
import { PageSpinner } from '@/components/ui/spinner'

if (loading) {
  return <PageSpinner />
}
```

---

## Design Principles

### ✅ DO:
- Use only the Spinner component for all loading states
- Keep it minimal - no text or labels
- Use appropriate sizes for context
- Center spinners in their container

### ❌ DON'T:
- Add "Loading..." text or messages
- Use custom loading animations
- Use Loader2 icon directly from lucide-react
- Create different loading indicators

---

## Migration Completed

All pages and components now use the unified Spinner:

✅ **Full Page Loading:**
- PageLoader component
- PageSpinner component
- AuthGuard component
- Login page suspense fallback
- Reset password page suspense fallback

✅ **Inline Loading:**
- Dashboard page
- Profile page
- AI Assistant page
- Transactions page
- Notification center
- All buttons and forms

✅ **Removed:**
- All "Loading..." text messages
- All "Redirecting..." text messages
- Custom spinner implementations
- Loader2 direct usage in loaders

---

## Component Locations

- **Spinner:** `components/ui/spinner.tsx`
- **PageLoader:** `components/ui/page-loader.tsx`

---

**Last Updated:** October 12, 2025  
**Status:** ✅ Unified to single Spinner component  
**Design:** Minimal, text-free loading indicators
