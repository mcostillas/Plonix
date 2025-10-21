# Favicon Color Correction

## Date: October 21, 2025

## Problem
The favicon colors were not matching the official Plounix brand green color.

## Old Color vs New Color

### ❌ Old (Incorrect)
- **HEX:** `#10b981` (Tailwind emerald-500)
- **HSL:** `hsl(160, 84%, 39%)`
- **Description:** Too teal/blue-ish

### ✅ New (Correct - Plounix Brand)
- **HEX:** `#22c55e` (Tailwind green-500)
- **HSL:** `hsl(142.1, 76.2%, 36.3%)`
- **RGB:** `rgb(34, 197, 94)`
- **Description:** True vibrant green matching brand identity

## Files Updated

### 1. SVG Icon
- ✅ `public/icon.svg` - Updated stroke color from `#10b981` to `#22c55e`

### 2. PNG Favicons (Need Regeneration)
The following PNG files need to be regenerated with the correct color:
- `public/favicon-16x16.png`
- `public/favicon-32x32.png`
- `public/android-chrome-192x192.png`
- `public/android-chrome-512x512.png`
- `public/apple-touch-icon.png`
- `public/favicon.ico`

## How to Regenerate Favicons

### Option 1: Use the Generator Tool (Recommended)
1. Open `generate-favicon.html` in your browser
2. Click "Download All Favicons" button
3. Replace the files in `public/` folder
4. Use an online tool like [favicon.io](https://favicon.io/favicon-converter/) to convert the 32x32 PNG to `.ico` format

### Option 2: Use Online Service
1. Go to [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Upload the updated `public/icon.svg`
3. Generate all favicon formats
4. Download and replace in `public/` folder

### Option 3: Use Favicon.io
1. Go to [favicon.io](https://favicon.io/favicon-converter/)
2. Upload the updated `public/icon.svg`
3. Download the generated package
4. Extract and replace files in `public/` folder

## Color Consistency Across Project

The Plounix green (`#22c55e`) is defined in multiple places:

1. **CSS Variables** (`app/globals.css`):
   ```css
   --primary: 142.1 76.2% 36.3%; /* Plounix brand color */
   --ring: 142.1 76.2% 36.3%;
   ```

2. **SVG Icon** (`public/icon.svg`):
   ```xml
   stroke="#22c55e"
   ```

3. **Tailwind** (References CSS variables):
   ```typescript
   primary: {
     DEFAULT: "hsl(var(--primary))",
   }
   ```

## Verification

After updating the favicons:
1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard refresh (Ctrl + F5)
3. Check browser tab icon
4. Verify on mobile devices (iOS and Android)
5. Check dark mode appearance

## Visual Comparison

```
Old: #10b981 ████████ (emerald-500 - too teal)
New: #22c55e ████████ (green-500 - true Plounix green)
```

## Next Steps

1. ✅ Updated `public/icon.svg` with correct color
2. ⏳ Regenerate PNG favicons using the generator tool
3. ⏳ Replace PNG files in `public/` folder
4. ⏳ Test across all browsers and devices
5. ⏳ Commit and deploy changes

## Notes

- The brand green is intentionally vibrant to stand out
- This matches the primary color used throughout the app
- Consistency is crucial for brand recognition
- Consider using the same green in marketing materials
