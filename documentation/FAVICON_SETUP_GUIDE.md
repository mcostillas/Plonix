# Favicon & Icon Setup Guide

## 🎨 Quick Setup (5 minutes)

### Option 1: Use Favicon Generator (Recommended)
1. Go to **https://realfavicongenerator.net/**
2. Upload your Plounix logo (PNG, at least 512x512px)
3. Customize:
   - iOS: Enable "Add solid color background" with green (#10b981)
   - Android: Use green theme color (#10b981)
   - Windows: Use green tile color
4. Click "Generate favicons"
5. Download the package
6. Extract ALL files to `/public/` folder
7. Done! ✅

### Option 2: Use Figma/Canva (DIY)
1. Create a 512x512px square design
2. Use Plounix brand colors (purple #9333ea)
3. Export as PNG
4. Go to https://favicon.io/favicon-converter/
5. Upload your PNG
6. Download and extract to `/public/`

---

## 📁 Required Files

Place these in the `/public/` folder:

```
public/
├── favicon.ico          # 32x32, legacy browsers
├── icon-16x16.png      # 16x16, browser tab
├── icon-32x32.png      # 32x32, browser tab
├── icon-192x192.png    # 192x192, Android
├── icon-512x512.png    # 512x512, PWA
├── apple-icon.png      # 180x180, iOS
├── og-image.png        # 1200x630, social sharing
└── site.webmanifest    # Already created ✅
```

---

## 🎯 Icon Design Tips

### Logo Design Ideas:
1. **Simple "P" monogram** with purple background
2. **Peso sign (₱)** with modern styling
3. **Piggy bank icon** minimalist style
4. **Upward arrow + peso** symbolizing growth
5. **Book + money** representing financial literacy

### Colors to Use:
- Primary: `#10b981` (Green - Plounix brand color!)
- Secondary: `#059669` (Darker green - for depth)
- Accent: `#d1fae5` (Light green - for highlights)

### Design Rules:
- ✅ Keep it simple (recognizable at 16x16)
- ✅ High contrast for visibility
- ✅ Works on light AND dark backgrounds
- ✅ No thin lines (won't show at small sizes)
- ❌ Avoid text (unreadable at small sizes)
- ❌ Don't use gradients (loses clarity)

---

## 🖼️ OG Image (Social Sharing)

Create a **1200x630px** image for social media previews:

**Content:**
- Plounix logo/icon
- Tagline: "Financial Literacy for Filipino Youth"
- Background: Green gradient (#10b981 to #059669) or branded design
- Text: Large, readable font (white text on green background)

**Tools:**
- Canva: https://www.canva.com/create/og-images/
- Figma: https://www.figma.com/
- Adobe Express: https://www.adobe.com/express/

Save as: `/public/og-image.png`

---

## ✅ Testing After Setup

1. **Favicon:**
   - Open https://www.plounix.xyz in browser
   - Check browser tab for icon
   - Check bookmarks bar

2. **PWA Icons:**
   - Open on mobile browser
   - Add to home screen
   - Check if icon appears

3. **Social Sharing:**
   - Share link on Facebook, Twitter, LinkedIn
   - Check preview card shows correct image/text
   - Use: https://www.opengraph.xyz/ to test

4. **SEO:**
   - Google: "site:plounix.xyz"
   - Check meta description in search results
   - Verify with Google Search Console

---

## 🚀 After Adding Icons

Run these commands:
```bash
git add public/
git commit -m "feat: Add favicons and SEO meta images"
git push
```

Wait 2-3 minutes for Vercel deployment, then test!

---

## 📌 Next Steps

1. ✅ Generate icons using realfavicongenerator.net
2. ✅ Place all files in `/public/`
3. ✅ Create OG image (1200x630)
4. ✅ Test on multiple devices
5. ✅ Submit to Google Search Console
6. ✅ Test social sharing on all platforms

---

## 🔗 Helpful Resources

- **Favicon Generator:** https://realfavicongenerator.net/
- **OG Image Generator:** https://www.opengraph.xyz/
- **Icon Converter:** https://favicon.io/
- **Test OG Tags:** https://www.opengraph.xyz/
- **Test SEO:** https://pagespeed.web.dev/

---

**Need help?** Check the images should be:
- Sharp and clear
- Recognizable at tiny sizes
- On-brand with Plounix GREEN colors (#10b981)
- Optimized for web (compressed PNG)

---

## 🎨 Plounix Brand Colors Reference

**Primary Green:** `#10b981` (Main brand color)
**Dark Green:** `#059669` (Depth/shadows)
**Light Green:** `#d1fae5` (Highlights/accents)
**White:** `#ffffff` (Text on green)

Use these consistently across all icons and images!
