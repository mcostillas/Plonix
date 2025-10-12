# Email System - Quick Reference

## ✅ What's Been Set Up

1. **Email Library** (`lib/email.ts`)
   - Nodemailer integration with Gmail SMTP
   - Pre-built email templates (Welcome, Bill Reminder, Goal Achievement, Password Reset)
   - Helper functions for common email operations

2. **API Endpoint** (`app/api/send-email/route.ts`)
   - POST: Send test emails and template emails
   - GET: Check configuration status

3. **Test Page** (`app/test-email/page.tsx`)
   - Visual interface to test email functionality
   - Configuration status checker
   - Test email sender

4. **Documentation** (`docs/EMAIL_SETUP_GUIDE.md`)
   - Complete setup instructions for Gmail
   - Troubleshooting guide
   - Integration examples

## 🚀 Quick Start

### 1. Get Gmail App Password
```
1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to: https://myaccount.google.com/apppasswords
4. Create app password for "Mail"
5. Copy the 16-character password
```

### 2. Configure .env.local
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
SMTP_SECURE=false
SMTP_FROM_NAME=Plounix
SMTP_FROM_EMAIL=your_email@gmail.com
```

### 3. Test It
```bash
npm run dev
# Open: http://localhost:3000/test-email
```

## 📧 Usage Examples

### Send Welcome Email
```typescript
import { sendWelcomeEmail } from '@/lib/email'

// In your registration handler
await sendWelcomeEmail(userName, userEmail)
```

### Send Bill Reminder
```typescript
import { sendBillReminder } from '@/lib/email'

await sendBillReminder(
  'John Doe',
  'john@example.com',
  'Electricity Bill',
  2500,
  15
)
```

### Send Goal Achievement
```typescript
import { sendGoalAchievedEmail } from '@/lib/email'

await sendGoalAchievedEmail(
  'John Doe',
  'john@example.com',
  'Emergency Fund',
  10000
)
```

### Send Custom Email
```typescript
import { sendEmail } from '@/lib/email'

await sendEmail({
  to: 'user@example.com',
  subject: 'Your Subject',
  text: 'Plain text',
  html: '<h1>HTML content</h1>'
})
```

## 🧪 Testing

### Via Test Page
```
http://localhost:3000/test-email
```

### Via API (curl)
```bash
# Check status
curl http://localhost:3000/api/send-email

# Send test email
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"action":"test","to":"your@email.com"}'

# Send welcome email
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"action":"welcome","to":"your@email.com","userName":"John"}'
```

### Via Browser Console
```javascript
// Check status
fetch('/api/send-email').then(r => r.json()).then(console.log)

// Send test
fetch('/api/send-email', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({action:'test', to:'your@email.com'})
}).then(r => r.json()).then(console.log)
```

## 📊 Available Templates

| Template | Function | Use Case |
|----------|----------|----------|
| Welcome | `sendWelcomeEmail()` | New user registration |
| Bill Reminder | `sendBillReminder()` | Upcoming bill notifications |
| Goal Achievement | `sendGoalAchievedEmail()` | Financial goal completed |
| Password Reset | `sendPasswordResetEmail()` | Password recovery |

## 🔧 Configuration Reference

### Environment Variables
```env
SMTP_HOST=smtp.gmail.com          # Gmail SMTP server
SMTP_PORT=587                      # Port (587 or 465)
SMTP_USER=your@gmail.com          # Your Gmail address
SMTP_PASS=apppasswordhere         # 16-char app password
SMTP_SECURE=false                  # true for 465, false for 587
SMTP_FROM_NAME=Plounix            # Sender name
SMTP_FROM_EMAIL=your@gmail.com    # Sender email
```

### Gmail Limits
- Free: 500 emails/day
- Workspace: 2000 emails/day

## 🎨 Customization

All email templates are in `lib/email.ts`. You can:
- Edit HTML/CSS styles
- Change colors and branding
- Add new template functions
- Modify content

## 📁 File Structure

```
lib/
  email.ts                    # Email library & templates
app/
  api/
    send-email/
      route.ts                # API endpoint
  test-email/
    page.tsx                  # Test interface
docs/
  EMAIL_SETUP_GUIDE.md        # Full documentation
  EMAIL_QUICK_REFERENCE.md    # This file
```

## ⚠️ Common Issues

**Connection Failed?**
- Check App Password (no spaces!)
- Verify 2-Step Verification is ON
- Restart dev server after .env changes

**Emails Not Arriving?**
- Check spam folder
- Wait a few minutes
- Verify Gmail "Sent" folder

**Invalid Login?**
- Regenerate App Password
- Double-check SMTP_USER matches Gmail

## 🔐 Security

- ✅ Never commit .env files
- ✅ Use App Passwords only
- ✅ Rotate passwords regularly
- ✅ Use environment variables in production

## 📞 Need Help?

See full guide: `docs/EMAIL_SETUP_GUIDE.md`

---

**Status**: ✅ Production Ready  
**Last Updated**: January 2025
