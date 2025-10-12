# Dark Mode Implementation - TODO

## Status: UNDER WORKS 🚧

This document tracks the dark mode implementation for Plounix. The dark mode feature is **currently disabled** and will be fully implemented in the next iteration.

## What Was Disabled

### Theme Provider Forced to Light Mode
- **Theme Provider** (`components/ThemeProvider.tsx`) - Now forces light mode only
- Saved dark mode preferences are cleared from localStorage
- Database theme preferences are ignored (always loads light mode)
- `setTheme()` and `toggleTheme()` functions now force light mode

### Theme Toggle Removed
- **AI Assistant Settings** (`app/ai-assistant/page.tsx`) - Theme toggle button commented out
- Users can no longer switch between light/dark mode
- The `useTheme` hook import is commented out
- All theme-related functionality is preserved in comments for future re-enablement

## Current Status

### ✅ Already Has Dark Mode Support (But Disabled)
- **AI Assistant** (`app/ai-assistant/page.tsx`) - Has full dark mode classes but toggle is disabled
- **Theme Provider** (`components/ThemeProvider.tsx`) - Already implemented but not accessible
- **CSS Variables** (`app/globals.css`) - Dark mode color scheme defined

### 🔒 Theme Toggle Disabled
The theme toggle in AI Assistant settings has been **commented out** with:
```tsx
// TODO: Dark mode under works - Theme toggle temporarily disabled
```

Location: `app/ai-assistant/page.tsx` (around line 1412-1443)

## Re-enabling Instructions

To re-enable dark mode in the future:

1. **Restore Theme Provider** (`components/ThemeProvider.tsx`):
   ```tsx
   // In the loadTheme function for non-authenticated users:
   const savedTheme = localStorage.getItem('plounix_theme') as Theme
   if (savedTheme) {
     setThemeState(savedTheme)
     applyTheme(savedTheme)
   }
   
   // In the loadTheme function for authenticated users:
   const savedTheme = prefs.theme || 'light'
   setThemeState(savedTheme)
   applyTheme(savedTheme)
   
   // In the setTheme function - restore original implementation:
   setThemeState(newTheme)
   applyTheme(newTheme)
   localStorage.setItem('plounix_theme', newTheme)
   // ... rest of database saving code
   
   // In the toggleTheme function:
   setTheme(theme === 'light' ? 'dark' : 'light')
   ```

2. **Uncomment in AI Assistant** (`app/ai-assistant/page.tsx`):
   ```tsx
   // Line ~26: Uncomment the import
   import { useTheme } from '@/components/ThemeProvider'
   
   // Line ~75: Uncomment the hook
   const { theme, setTheme } = useTheme()
   
   // Line ~470-476: Uncomment the useEffect
   useEffect(() => {
     console.log('🎨 Current theme:', theme)
   }, [theme])
   
   // Line ~1412-1443: Uncomment the entire theme toggle button
   ```

3. **Clear browser cache and localStorage** to remove any old dark mode settings

4. **Test the toggle** in the AI Assistant settings menu

### 🚧 Marked for Future Implementation

The following pages have been marked with `// TODO: Dark mode under works` comments:

1. **Landing Page** (`app/page.tsx`)
   - Main container needs: `bg-background text-foreground`
   - Navigation needs: `bg-background/80`
   - Hero section needs: `dark:from-primary/10 dark:via-blue-900/10 dark:to-green-900/10`
   - Stats section needs: `dark:bg-muted/20`
   - Footer needs: `dark:bg-gray-950`

2. **Dashboard** (`app/dashboard/page.tsx`)
   - Main container needs: `bg-background text-foreground`
   - Welcome banner needs: `dark:from-green-600 dark:to-blue-700`
   - Welcome header needs: `dark:from-primary/20 dark:to-blue-600/20`
   - Text colors need: `text-foreground` and `text-muted-foreground`

3. **Profile** (`app/profile/page.tsx`)
   - Main container needs: `bg-background text-foreground`
   - Avatar modal overlay needs: `dark:bg-black/70`
   - Avatar modal content needs: `bg-background text-foreground`

4. **Test AI** (`app/test-ai/page.tsx`)
   - Main container needs: `bg-background text-foreground`

5. **Learning** (`app/learning/page.tsx`)
   - Main container needs: `bg-background text-foreground`

6. **Learning Detail** (`app/learning/[topicId]/page.tsx`)
   - Main container needs: `bg-background text-foreground`

7. **Goals** (`app/goals/page.tsx`)
   - Main container needs: `bg-gradient-to-br from-muted/30 via-background to-muted/30 dark:from-muted/10 dark:via-background dark:to-muted/10`

8. **Challenges** (`app/challenges/page.tsx`)
   - Main container needs: `bg-background text-foreground`

## Next Steps for Implementation

### Phase 1: Semantic Classes (Recommended Approach)
Replace hardcoded colors with semantic Tailwind classes that automatically adapt to dark mode:

```tsx
// Instead of:
<div className="bg-white text-gray-900">

// Use:
<div className="bg-background text-foreground">
```

### Phase 2: Dark Mode Prefix (Alternative Approach)
For sections that need specific styling:

```tsx
// Example:
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
```

## CSS Variables Reference

Available semantic colors (defined in `globals.css`):

### Light Mode
- `--background: 0 0% 100%` (white)
- `--foreground: 240 10% 3.9%` (dark gray)
- `--card: 0 0% 100%`
- `--muted: 240 4.8% 95.9%`
- `--primary: 142.1 76.2% 36.3%` (green)

### Dark Mode
- `--background: 240 10% 3.9%` (dark)
- `--foreground: 0 0% 98%` (light)
- `--card: 240 10% 3.9%`
- `--muted: 240 3.7% 15.9%`
- `--primary: 142.1 70.6% 45.3%` (lighter green)

## Testing Checklist

When implementing dark mode:

- [ ] Test all pages with dark mode toggle
- [ ] Verify text contrast meets accessibility standards
- [ ] Check card components in both modes
- [ ] Test navigation and sidebars
- [ ] Verify form inputs are readable
- [ ] Check modal overlays and dialogs
- [ ] Test buttons and interactive elements
- [ ] Verify icons and illustrations
- [ ] Check loading states and skeletons
- [ ] Test with system preference auto-detection

## Resources

- Tailwind Dark Mode Docs: https://tailwindcss.com/docs/dark-mode
- Plounix Theme Provider: `components/ThemeProvider.tsx`
- CSS Variables: `app/globals.css`

## Notes

- The AI Assistant page (`app/ai-assistant/page.tsx`) already has comprehensive dark mode support and can be used as a reference.
- The theme toggle is available in the AI Assistant settings menu
- System preference detection is handled by `next-themes` in ThemeProvider

---

**Last Updated:** October 12, 2025
**Status:** Ready for implementation in next sprint
