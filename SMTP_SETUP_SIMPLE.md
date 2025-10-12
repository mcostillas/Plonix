# 🚀 Quick Email Setup Guide

## ❌ Can't Enable Supabase Custom SMTP?

**No problem!** That's a paid feature. Our solution works **without it** using direct Gmail SMTP connection.

---

## ✅ Quick Setup (5 Minutes)

### Step 1: Get Gmail App Password

1. Open: https://myaccount.google.com/security
   - Enable **2-Step Verification** (if not already enabled)

2. Open: https://myaccount.google.com/apppasswords
   - Select app: **Mail**
   - Select device: **Other (custom name)**
   - Type: **Plounix**
   - Click **Generate**
   - **COPY** the 16-character password (example: `abcd efgh ijkl mnop`)
   - ⚠️ **Remove all spaces!** → `abcdefghijklmnop`

### Step 2: Create Your .env.local File

1. **If you DON'T have a `.env.local` file yet**:
   ```bash
   # Copy the template
   copy .env.local.template .env.local
   ```

2. **If you ALREADY have a `.env.local` file**:
   - Just open it and add the SMTP variables at the bottom

3. **Edit `.env.local`** and add:
   ```env
   # SMTP Email Configuration (Gmail)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=youremail@gmail.com
   SMTP_PASS=abcdefghijklmnop
   SMTP_SECURE=false
   SMTP_FROM_NAME=Plounix
   SMTP_FROM_EMAIL=youremail@gmail.com
   ```

   **Replace**:
   - `youremail@gmail.com` → Your actual Gmail
   - `abcdefghijklmnop` → Your 16-char app password (no spaces!)

### Step 3: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test It!

1. Open: http://localhost:3000/test-email

2. Click **"Check Status"** button
   - Should show: ✅ "Configured and Connected"

3. Enter your email and click **"Send Test Email"**
   - Check your inbox! 📧

---

## 🎯 You Don't Need Supabase SMTP!

### What We Built Uses:
- ✅ **Nodemailer** (direct SMTP connection)
- ✅ **Gmail SMTP** (free, 500 emails/day)
- ✅ **Your own credentials** (more control)
- ✅ **No Supabase dependency** (works independently)

### Why This Is Better:
- ✅ Free forever (no paid plan needed)
- ✅ Works right now (no waiting for approval)
- ✅ More control over emails
- ✅ Beautiful custom templates already built
- ✅ Perfect for Plounix use case

---

## 📧 What You Can Do Now

Once set up, you can:
- Send welcome emails to new users
- Send bill reminders
- Send goal achievement celebrations
- Send password reset emails
- Send any custom emails you want!

---

## 🆘 Troubleshooting

### "Can't find .env.local"
- It's normal! Just create one using the template
- Make sure you're in the project root folder

### "Connection Failed"
- Check your App Password (no spaces!)
- Make sure 2-Step Verification is ON
- Try regenerating the App Password

### "Still Not Working"
- Check console for error messages
- Verify dev server was restarted
- See full guide: `docs/EMAIL_SETUP_GUIDE.md`

---

## 📁 Files You Need

1. `.env.local` → Your credentials (CREATE THIS)
2. `.env.local.template` → Template to copy from (Already created ✅)
3. `docs/EMAIL_SETUP_GUIDE.md` → Full documentation (Already exists ✅)

---

## ✅ Summary

**You DON'T need Supabase Custom SMTP!**

Just:
1. Get Gmail App Password (2 minutes)
2. Add to `.env.local` (1 minute)
3. Restart server (10 seconds)
4. Test at `/test-email` (30 seconds)

**Total time: 5 minutes** 🚀

---

Need help? Just ask!
