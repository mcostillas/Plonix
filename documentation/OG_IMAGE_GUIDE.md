# 🖼️ What is an OG Image? (Open Graph Image)

## Simple Explanation

An **OG Image** is the preview image that appears when you share your website on:
- Facebook
- Twitter/X
- LinkedIn
- WhatsApp
- Discord
- Slack
- iMessage
- Any messaging app

**Example:**
When someone shares `www.plounix.xyz`, instead of just showing text, 
they see a nice image with your logo and branding!

---

## 📐 Size Requirements

**Standard:** 1200 x 630 pixels (1.91:1 ratio)

Why this size?
- Facebook's recommended size
- Works on Twitter, LinkedIn, WhatsApp
- Looks good on desktop AND mobile

---

## 🎨 What to Include in Your OG Image

### Must Have:
1. **Plounix logo/icon** (your green piggy bank!)
2. **Main text:** "Financial Literacy for Filipino Youth"
3. **Website:** www.plounix.xyz
4. **Green branding** (#10b981)

### Optional (but nice):
5. Tagline: "Master Budgeting, Saving & Investing"
6. Visual elements: Peso signs (₱), charts, growth arrows
7. Subtle pattern or gradient background

---

## ✅ Good Example Layout

```
┌─────────────────────────────────────────┐
│                                         │
│    🐷                                   │ <- Logo (top left)
│   Plounix                               │
│                                         │
│                                         │
│     Financial Literacy                 │ <- Big text (center)
│     for Filipino Youth                 │
│                                         │
│     Master Budgeting, Saving &         │ <- Subtitle
│     Investing with AI                  │
│                                         │
│                    www.plounix.xyz     │ <- URL (bottom right)
│                                         │
└─────────────────────────────────────────┘
```

**Colors:**
- Background: White or light green gradient
- Text: Dark green (#059669) or black
- Logo: Green (#10b981)
- Accents: Green shades

---

## 🚀 How to Create (Choose One)

### **Option 1: Canva (Easiest - 10 min)**

1. Go to https://www.canva.com/
2. Click "Custom Size" → 1200 x 630 pixels
3. Choose "Social Media" → "Facebook Post" template
4. Customize:
   - Change colors to green (#10b981)
   - Add your piggy bank logo
   - Add text: "Financial Literacy for Filipino Youth"
   - Add website URL
5. Download as PNG
6. Save as `og-image.png`

**Templates to try:**
- Search "Facebook cover" or "Social media post"
- Pick clean, modern designs
- Avoid cluttered templates

---

### **Option 2: Figma (More Control)**

1. Create 1200x630px frame
2. Add background (white or gradient)
3. Import your logo
4. Add text layers:
   - Title: 64px bold
   - Subtitle: 32px regular
   - URL: 24px
5. Export as PNG

---

### **Option 3: AI Generator**

Use **DALL-E, Midjourney, or Ideogram:**

```
Prompt: "Professional social media banner 1200x630px, 
green color scheme #10b981, minimalist design, 
text 'Financial Literacy for Filipino Youth', 
piggy bank icon, modern clean layout, white background"
```

---

### **Option 4: Use Online Tool**

**OG Image Generator:**
https://ogimage.netlify.app/

1. Enter your title
2. Customize colors to green
3. Download PNG

---

## 📋 Design Rules

### ✅ DO:
- Use large, readable fonts (minimum 32px)
- Keep text centered or left-aligned
- Use high contrast (dark text on light bg)
- Leave breathing room (don't crowd)
- Test on mobile preview
- Keep file under 1MB

### ❌ DON'T:
- Use tiny text (unreadable on mobile)
- Cram too much information
- Use more than 2-3 colors
- Put important stuff at edges (gets cropped)
- Use low-quality images
- Forget your branding

---

## 🎨 Plounix OG Image Specs

**Background Options:**
1. Solid white (#ffffff)
2. Light green (#d1fae5)
3. Gradient (white to light green)

**Text:**
- Headline: "Financial Literacy for Filipino Youth"
  - Font: Bold, 56-64px
  - Color: #059669 (dark green) or #1f2937 (dark gray)

- Subtitle: "Master Budgeting, Saving & Investing with AI"
  - Font: Regular, 28-32px
  - Color: #6b7280 (gray)

- URL: "www.plounix.xyz"
  - Font: Regular, 20-24px
  - Color: #10b981 (green)

**Logo:**
- Your green piggy bank icon
- Size: 80-120px
- Position: Top-left or center-top

---

## ✅ Testing Your OG Image

### Before Uploading:
1. **Scale down to 600x315** - still readable? ✅
2. **View on phone** - text clear? ✅
3. **Print it out** - looks good? ✅

### After Uploading:
1. **Test with tool:** https://www.opengraph.xyz/
   - Enter: www.plounix.xyz
   - See preview

2. **Test on social media:**
   - Share link on Facebook
   - Share on Twitter
   - Share on LinkedIn
   - Check WhatsApp preview

3. **Debug if needed:**
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/

---

## 📤 How to Add to Your Website

1. Create the image (1200x630px)
2. Save as: `og-image.png`
3. Put in: `/public/og-image.png`
4. Git commit and push
5. Wait for Vercel deployment (~2 min)
6. Clear cache and test!

**Already added to your site!** ✅  
Just need to create the actual image file.

---

## 💡 Pro Tips

**Inspiration:**
- Look at Canva's OG images
- Check Stripe, Notion, Linear (great examples)
- Keep it simple and professional

**Multiple Versions:**
- Create different OG images for different pages
- Dashboard: `og-image-dashboard.png`
- Pricing: `og-image-pricing.png`
- Blog posts: dynamic OG images

**Mobile First:**
- Most people share on phones
- Test preview on WhatsApp
- Ensure text is readable at small sizes

---

## 🎯 Your Next Steps

1. ✅ Create piggy bank icon (see PIGGY_BANK_ICON_GUIDE.md)
2. ✅ Go to Canva
3. ✅ Create 1200x630px design
4. ✅ Use Plounix green (#10b981)
5. ✅ Add text and logo
6. ✅ Download as PNG
7. ✅ Save to `/public/og-image.png`
8. ✅ Test with opengraph.xyz
9. ✅ Share and celebrate! 🎉

---

**Questions? Show me your draft and I'll give feedback!** 🚀
