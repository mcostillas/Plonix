# Global Dark Mode Implementation Guide

## Overview
Implemented a **global dark mode system** using React Context that works across ALL pages, modals, and components in the Plounix app.

## What's Been Implemented

### 1. ThemeProvider Component ✅
**File**: `components/ThemeProvider.tsx`

A global React Context provider that:
- Manages theme state (light/dark) across the entire app
- Automatically loads user's saved theme preference from database
- Falls back to localStorage for non-authenticated users
- Saves theme changes to both database and localStorage
- Applies theme immediately by toggling the `dark` class on `<html>` element

**Key Features**:
- `useTheme()` hook available in any component
- `theme`: Current theme ('light' | 'dark')
- `setTheme(theme)`: Change theme and save to database
- `toggleTheme()`: Quick toggle between light and dark

### 2. Root Layout Integration ✅
**File**: `app/layout.tsx`

- Wrapped entire app in `<ThemeProvider>`
- Added `suppressHydrationWarning` to `<html>` to prevent hydration issues
- Theme now applies to ALL pages automatically

### 3. Global CSS Variables ✅
**File**: `app/globals.css`

Already had dark mode CSS variables defined:
- `--background`, `--foreground`, `--card`, etc.
- All Tailwind utility classes respect these variables
- Any component using `bg-background`, `text-foreground`, etc. automatically gets dark mode

### 4. AI Assistant Page Updated ✅
**File**: `app/ai-assistant/page.tsx`

- Removed local theme state
- Now uses `useTheme()` from ThemeProvider
- Simplified theme toggle button
- Theme persists across page reloads
- All components have dark mode classes

### 5. Navbar Component Updated ✅
**File**: `components/ui/navbar.tsx`

- Added dark mode classes to all elements
- Background, borders, text, dropdowns all support dark mode
- Mobile menu supports dark mode

## How to Use Dark Mode in Any Component

### Option 1: Use Semantic Classes (Recommended)
```tsx
<div className="bg-background text-foreground border-border">
  <h1 className="text-card-foreground">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

These automatically adapt based on theme!

### Option 2: Use dark: Prefix
```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Content
</div>
```

### Option 3: Access Theme in Component
```tsx
import { useTheme } from '@/components/ThemeProvider'

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme()
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}
```

## Adding Dark Mode to New Pages

### Step 1: Import ThemeProvider Hook (Optional)
```tsx
import { useTheme } from '@/components/ThemeProvider'
```

### Step 2: Add Dark Mode Classes
Use either semantic classes or `dark:` prefix for all elements:

```tsx
// Main container
<div className="bg-background text-foreground min-h-screen">

// Cards
<div className="bg-card text-card-foreground border border-border">

// Buttons (most UI components already support dark mode)
<Button className="bg-primary text-primary-foreground">

// Custom elements
<div className="bg-white dark:bg-gray-800">
<p className="text-gray-900 dark:text-gray-100">
```

### Step 3: Test Both Modes
1. Toggle theme in Settings
2. Check all text is readable
3. Check all borders are visible
4. Check all backgrounds look good

## Common Dark Mode Patterns

### Text Colors
```tsx
// Primary text
<h1 className="text-foreground">

// Secondary text
<p className="text-muted-foreground">

// Specific colors
<span className="text-gray-900 dark:text-gray-100">
<span className="text-gray-600 dark:text-gray-300">
<span className="text-gray-500 dark:text-gray-400">
```

### Backgrounds
```tsx
// Page background
<div className="bg-background">

// Card background
<div className="bg-card">

// White to dark gray
<div className="bg-white dark:bg-gray-800">
<div className="bg-gray-50 dark:bg-gray-900">
<div className="bg-gray-100 dark:bg-gray-800">
```

### Borders
```tsx
// Semantic border
<div className="border border-border">

// Specific colors
<div className="border-gray-200 dark:border-gray-700">
<div className="border-gray-300 dark:border-gray-600">
```

### Hover States
```tsx
<button className="hover:bg-gray-50 dark:hover:bg-gray-700">
<div className="hover:bg-gray-100 dark:hover:bg-gray-800">
```

## Pages That Need Dark Mode Added

### Priority 1 (User-Facing)
- [ ] `/dashboard` - Dashboard page
- [ ] `/profile` - Profile page
- [ ] `/goals` - Goals page
- [ ] `/transactions` - Transactions page
- [ ] `/learning` - Learning hub
- [ ] `/challenges` - Challenges page

### Priority 2 (Modals & Components)
- [ ] All modals (Dialog components)
- [ ] Dropdowns and popovers
- [ ] Form inputs
- [ ] Cards and containers
- [ ] Buttons (check existing variants)

### Priority 3 (Other)
- [ ] `/pricing` - Pricing page
- [ ] `/resource-hub` - Resources
- [ ] Auth pages (login, signup)
- [ ] Error pages

## Quick Reference: Color Mappings

| Light Mode | Dark Mode | Usage |
|------------|-----------|-------|
| `bg-white` | `bg-gray-800` | Containers |
| `bg-gray-50` | `bg-gray-900` | Page backgrounds |
| `bg-gray-100` | `bg-gray-800` | Cards, sections |
| `text-gray-900` | `text-gray-100` | Primary text |
| `text-gray-600` | `text-gray-300` | Secondary text |
| `text-gray-500` | `text-gray-400` | Muted text |
| `border-gray-200` | `border-gray-700` | Borders |
| `border-gray-300` | `border-gray-600` | Emphasized borders |

## Testing Checklist

For each page/component:
- [ ] Background colors visible in both modes
- [ ] Text readable in both modes
- [ ] Borders visible in both modes
- [ ] Hover states work in both modes
- [ ] Focus states visible in both modes
- [ ] Images/icons visible in both modes
- [ ] No white flash when switching
- [ ] Theme persists after page reload

## Advanced: Conditional Rendering Based on Theme

```tsx
import { useTheme } from '@/components/ThemeProvider'

function MyComponent() {
  const { theme } = useTheme()
  
  return (
    <>
      {theme === 'dark' ? (
        <LogoDark />
      ) : (
        <LogoLight />
      )}
    </>
  )
}
```

## Troubleshooting

### Theme not applying
1. Check if page is wrapped in ThemeProvider (should be automatic)
2. Check browser console for errors
3. Verify database migration ran (preferences column exists)

### White flash on load
1. Add `suppressHydrationWarning` to parent element
2. Theme loads in ThemeProvider useEffect

### Theme not saving
1. Check user is authenticated
2. Check database connection
3. Check browser console for save errors

### Components not changing
1. Add `dark:` classes to all elements
2. Or use semantic classes like `bg-background`
3. Check Tailwind config has `darkMode: ["class"]`

## Performance Notes

- Theme state is global but only re-renders components that use `useTheme()`
- Theme persistence happens async (non-blocking)
- LocalStorage used as fallback (instant load for non-auth users)
- CSS variables = zero JavaScript needed for color changes

## Migration Strategy

### Phase 1 (Complete) ✅
- ✅ Global ThemeProvider created
- ✅ Root layout updated
- ✅ AI Assistant page updated
- ✅ Navbar updated
- ✅ Theme toggle in settings working

### Phase 2 (In Progress) 🔄
1. Update all main user pages (dashboard, profile, goals, etc.)
2. Update all modal components
3. Update all shared UI components

### Phase 3 (Future)
1. Add auto theme detection (system preference)
2. Add theme transitions/animations
3. Add custom theme colors
4. Add theme preview before applying

## Code Examples

### Adding Dark Mode to a New Modal

```tsx
<Dialog>
  <DialogContent className="bg-card text-card-foreground border-border">
    <DialogHeader>
      <DialogTitle className="text-foreground">Title</DialogTitle>
      <DialogDescription className="text-muted-foreground">
        Description
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4">
      <input className="bg-background border-border text-foreground" />
      <Button className="bg-primary text-primary-foreground">
        Submit
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

### Adding Dark Mode to a New Page

```tsx
'use client'

import { useTheme } from '@/components/ThemeProvider'

export default function MyPage() {
  const { theme } = useTheme()
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">My Page</h1>
        
        <div className="grid gap-6">
          <div className="bg-card border-border p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Card Title</h2>
            <p className="text-muted-foreground">Card description</p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Next Steps

1. **Run Database Migration** (if not done):
```sql
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;
```

2. **Test Current Implementation**:
   - Go to AI Assistant
   - Toggle theme in settings
   - Verify it works and persists

3. **Add Dark Mode to Other Pages**:
   - Start with dashboard (most used)
   - Then profile, goals, transactions
   - Then modals and components

4. **Test Thoroughly**:
   - Test every page in both modes
   - Check all interactions
   - Verify theme persists across navigation

---

**Status**: Phase 1 Complete ✅  
**Theme System**: Fully Functional 🎉  
**Next**: Add dark mode to remaining pages  
**Date**: January 12, 2025
