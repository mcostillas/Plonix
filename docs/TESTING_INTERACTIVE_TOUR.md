# Testing Interactive Tour - Quick Guide

## Issue Reported
"Nothing happens after clicking next"

## Fix Applied
Removed manual `stepIndex` state management - let Joyride handle step progression automatically.

## To Test the Tour:

### Method 1: Clear localStorage (Easiest)
1. Open browser console (F12)
2. Run this command:
```javascript
localStorage.removeItem('plounix_tour_shown')
location.reload()
```

### Method 2: Register New Account
1. Logout current account
2. Register with new email
3. Tour should start automatically on dashboard

### Method 3: Manual Trigger
1. Open console
2. Clear both flags:
```javascript
localStorage.removeItem('plounix_tour_shown')
localStorage.removeItem('plounix_onboarding_completed')
location.reload()
```

## What to Check:

### Console Logs to Look For:
```
✅ Dashboard: Onboarding completed (localStorage)
🎯 Tour shown status: null (or 'true')
🚀 Setting showTour to true
🎯 Dashboard rendering, showTour: true
🎯 InteractiveTour mounted, starting tour...
🎯 Tour callback: { status: 'running', action: 'next', index: 1, type: 'step:after' }
```

### Expected Behavior:
1. **Welcome screen appears** (centered overlay with purple background)
2. **Click "Next"** → Should move to Step 2 (AI Assistant)
3. **Progress bar** at top should update (1/8, 2/8, etc.)
4. **Spotlight effect** should highlight the AI Assistant card
5. **Tooltip** should appear with arrow pointing to card
6. Continue clicking Next through all 8 steps
7. **Last step** button should say "Get Started!"
8. After completion → Tour disappears, localStorage sets `plounix_tour_shown = 'true'`

### If Nothing Happens on "Next":
Check console for:
- ❌ Errors about missing elements
- ❌ `data-tour` attributes not found
- ❌ Joyride library not loaded
- ❌ `showTour` is false

### Common Issues:

#### 1. Tour doesn't appear
**Check:** 
```javascript
localStorage.getItem('plounix_tour_shown') // Should be null or undefined
```
**Fix:** Clear localStorage as shown above

#### 2. Tour appears but stuck on first step
**Check console for:**
- Errors about `[data-tour="ai-assistant"]` not found
- Elements might not be rendered yet

**Fix:** Wait for dashboard to fully load, then start tour

#### 3. Next button doesn't work
**Check:**
- Console shows click events: `🎯 Tour callback: { action: 'next' }`
- If no logs appear → Joyride not receiving clicks
- Check if tooltip is clickable (z-index issues)

#### 4. Steps skip or jump
**This was the original issue:** Manual stepIndex control
**Fixed by:** Removing stepIndex state, letting Joyride auto-manage

## Debug Commands

### Check tour state:
```javascript
// Current tour status
localStorage.getItem('plounix_tour_shown')

// Onboarding status
localStorage.getItem('plounix_onboarding_completed')

// Force show tour
localStorage.removeItem('plounix_tour_shown')
```

### Check if elements exist:
```javascript
// Should find the AI card
document.querySelector('[data-tour="ai-assistant"]')

// Should find all tour targets
document.querySelectorAll('[data-tour]')
```

### Manual tour control (in React DevTools):
Find `DashboardContent` component and toggle `showTour` state

## Expected Console Output (Successful Tour):

```
✅ Dashboard: Onboarding completed (localStorage)
🎯 Tour shown status: null
🚀 Setting showTour to true
🎯 Dashboard rendering, showTour: true
🎯 InteractiveTour mounted, starting tour...
🎯 Tour callback: { status: 'running', action: 'start', index: 0, type: 'tour:start' }
🎯 Tour callback: { status: 'running', action: 'next', index: 1, type: 'step:after' }
🎯 Tour callback: { status: 'running', action: 'next', index: 2, type: 'step:after' }
🎯 Tour callback: { status: 'running', action: 'next', index: 3, type: 'step:after' }
🎯 Tour callback: { status: 'running', action: 'next', index: 4, type: 'step:after' }
🎯 Tour callback: { status: 'running', action: 'next', index: 5, type: 'step:after' }
🎯 Tour callback: { status: 'running', action: 'next', index: 6, type: 'step:after' }
🎯 Tour callback: { status: 'running', action: 'next', index: 7, type: 'step:after' }
🎯 Tour callback: { status: 'finished', action: 'next', index: 7, type: 'tour:end' }
✅ Tour completed or skipped
✅ Tour completed, setting localStorage
```

## Changes Made to Fix "Next" Button:

### Before (BROKEN):
```typescript
const [stepIndex, setStepIndex] = useState(0)

const handleJoyrideCallback = (data: CallBackProps) => {
  if (type === 'step:after' || type === 'step:before') {
    setStepIndex(index) // ❌ Manually controlling steps
  }
}

<Joyride stepIndex={stepIndex} ... /> // ❌ Controlled mode
```

### After (FIXED):
```typescript
// ✅ Removed stepIndex state

const handleJoyrideCallback = (data: CallBackProps) => {
  // ✅ Only handle completion, let Joyride progress naturally
  if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
    onComplete()
  }
}

<Joyride continuous ... /> // ✅ Uncontrolled mode with continuous
```

## Why This Fixes It:

Joyride has two modes:
1. **Controlled** - You manage `stepIndex` state
2. **Uncontrolled** - Joyride manages progression internally

When using `continuous={true}`, Joyride should be **uncontrolled**. We were mixing both modes, causing the Next button to not update the step.

By removing `stepIndex` prop and state, Joyride now controls progression automatically!
