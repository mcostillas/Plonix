# Email Setup Guide - Gmail SMTP for Plounix

## Overview
This guide will help you set up email functionality in Plounix using Gmail SMTP. This is the easiest method for personal testing and works perfectly for the free tier.

---

## 🔥 Quick Setup (Gmail)

### Step 1: Enable 2-Step Verification

1. Go to: https://myaccount.google.com/security
2. Click on **"2-Step Verification"**
3. Follow the prompts to enable it for your Google account

> ⚠️ **Important**: You MUST have 2-Step Verification enabled to create App Passwords.

---

### Step 2: Create an App Password

1. Go to: https://myaccount.google.com/apppasswords
2. In the "Select app" dropdown, choose **"Mail"**
3. In the "Select device" dropdown, choose **"Other (custom name)"**
4. Type: **"Plounix"** or **"My App"**
5. Click **"Generate"**
6. Copy the **16-character app password** (it will look like: `abcd efgh ijkl mnop`)

> 💡 **Tip**: Save this password somewhere safe - you won't be able to see it again!

---

### Step 3: Configure Your .env File

1. Open your `.env.local` file (or create it if it doesn't exist)
2. Add the following configuration:

```env
# SMTP Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=your_16_character_app_password
SMTP_SECURE=false
SMTP_FROM_NAME=Plounix
SMTP_FROM_EMAIL=youremail@gmail.com
```

**Replace**:
- `youremail@gmail.com` → Your actual Gmail address
- `your_16_character_app_password` → The 16-character password from Step 2 (remove spaces!)

**Example**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=john.doe@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_SECURE=false
SMTP_FROM_NAME=Plounix
SMTP_FROM_EMAIL=john.doe@gmail.com
```

---

### Step 4: Test Your Configuration

1. **Start your development server**:
```bash
npm run dev
```

2. **Test the email connection** (open in browser or use curl):

**Check Status**:
```
http://localhost:3000/api/send-email
```

**Send Test Email**:
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"action": "test", "to": "youremail@gmail.com"}'
```

Or use this JavaScript in your browser console:
```javascript
fetch('/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'test',
    to: 'youremail@gmail.com'
  })
}).then(r => r.json()).then(console.log)
```

3. **Check your inbox** - you should receive a test email! 📧

---

## 📧 Available Email Functions

### 1. Send Welcome Email
Automatically sent when a user signs up:
```typescript
import { sendWelcomeEmail } from '@/lib/email'

await sendWelcomeEmail('John Doe', 'john@example.com')
```

### 2. Send Bill Reminder
Notify users about upcoming bills:
```typescript
import { sendBillReminder } from '@/lib/email'

await sendBillReminder(
  'John Doe',
  'john@example.com',
  'Electricity Bill',
  2500,
  15 // due day of month
)
```

### 3. Send Goal Achievement Email
Celebrate when users reach their financial goals:
```typescript
import { sendGoalAchievedEmail } from '@/lib/email'

await sendGoalAchievedEmail(
  'John Doe',
  'john@example.com',
  'Emergency Fund',
  10000
)
```

### 4. Send Password Reset Email
For password recovery:
```typescript
import { sendPasswordResetEmail } from '@/lib/email'

await sendPasswordResetEmail(
  'John Doe',
  'john@example.com',
  'https://yourapp.com/reset-password?token=abc123'
)
```

### 5. Send Custom Email
For any other use case:
```typescript
import { sendEmail } from '@/lib/email'

await sendEmail({
  to: 'user@example.com',
  subject: 'Your custom subject',
  text: 'Plain text version',
  html: '<h1>HTML version</h1>'
})
```

---

## 🧪 Testing via API

### Test Email (Basic)
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "action": "test",
    "to": "recipient@example.com"
  }'
```

### Test Welcome Email
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "action": "welcome",
    "to": "newuser@example.com",
    "userName": "John Doe"
  }'
```

### Check Configuration Status
```bash
curl http://localhost:3000/api/send-email
```

---

## 🔧 Troubleshooting

### Error: "Email server connection failed"

**Solution 1**: Check your credentials
- Make sure `SMTP_USER` is your full Gmail address
- Make sure `SMTP_PASS` is the 16-character App Password (no spaces!)
- Verify 2-Step Verification is enabled on your Google account

**Solution 2**: Check Gmail settings
- Go to https://myaccount.google.com/lesssecureapps
- Make sure "Less secure app access" is OFF (we use App Passwords instead)

**Solution 3**: Restart your dev server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Error: "Invalid login"

- Double-check your App Password (no spaces, exactly 16 characters)
- Generate a new App Password and try again
- Make sure you're using your Gmail address, not another email

### Emails not arriving

1. **Check spam folder** - Gmail might filter test emails
2. **Wait a few minutes** - Sometimes there's a delay
3. **Try a different recipient** - Some email providers block automated emails
4. **Check Gmail's "Sent" folder** - Verify the email was actually sent

### Port 587 blocked?

Try port 465 with secure connection:
```env
SMTP_PORT=465
SMTP_SECURE=true
```

---

## 🚀 Production Deployment

### For Vercel:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add each SMTP variable:
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `your_gmail@gmail.com`
   - `SMTP_PASS` = `your_app_password`
   - `SMTP_SECURE` = `false`
   - `SMTP_FROM_NAME` = `Plounix`
   - `SMTP_FROM_EMAIL` = `your_gmail@gmail.com`

4. Redeploy your application

> ⚠️ **Security**: Never commit your `.env.local` file! It's already in `.gitignore`.

---

## 📊 Gmail Limits

**Free Gmail Account**:
- 500 emails per day
- 100 recipients per email
- Perfect for testing and small apps

**Gmail Workspace** (if you upgrade):
- 2,000 emails per day
- Better deliverability
- Custom domain support

---

## 🎨 Customizing Email Templates

All email templates are in `lib/email.ts`. You can customize:

1. **Colors**: Change the gradient colors in the HTML
2. **Layout**: Modify the HTML structure
3. **Content**: Update text, add images, etc.
4. **Styling**: Edit the inline CSS styles

Example:
```typescript
// In lib/email.ts, find the template and modify:
.header { 
  background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
}
```

---

## 🔐 Security Best Practices

1. ✅ **Use App Passwords** (never your real Gmail password)
2. ✅ **Keep credentials in .env.local** (never commit)
3. ✅ **Enable 2-Step Verification**
4. ✅ **Rotate passwords regularly**
5. ✅ **Use environment variables in production**
6. ✅ **Monitor email sending logs**

---

## 💡 Next Steps

Once email is working, you can integrate it into your app:

1. **Welcome Emails**: Send when users register
2. **Bill Reminders**: Scheduled emails for upcoming bills
3. **Goal Achievements**: Celebrate user milestones
4. **Password Reset**: Implement forgot password flow
5. **Weekly Reports**: Send financial summaries
6. **Challenge Notifications**: Remind users about challenges

---

## 📞 Need Help?

- Check console logs for detailed error messages
- All email functions log success/failure with `console.log`
- Test API endpoint returns detailed status info
- Gmail App Password issues? Regenerate a new one

---

## ✅ Checklist

- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password generated
- [ ] .env.local file created with SMTP credentials
- [ ] Dev server restarted
- [ ] Test email sent successfully
- [ ] Test email received in inbox
- [ ] Welcome email template tested
- [ ] Ready to integrate into app features!

---

**Last Updated**: January 2025  
**Status**: ✅ Production Ready  
**Tested With**: Gmail, Node.js 20+, Next.js 14
