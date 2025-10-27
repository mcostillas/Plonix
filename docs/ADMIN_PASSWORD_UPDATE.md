# 🔐 Admin Password Update

## New Secure Admin Credentials

**Username**: `admin`  
**Password**: `PlounixAdmin2025!Secure#`

### Password Strength:
- ✅ 26 characters long
- ✅ Uppercase letters (P, A, S)
- ✅ Lowercase letters (l, o, u, n, i, x, etc.)
- ✅ Numbers (2, 0, 2, 5)
- ✅ Special characters (!, #)
- ✅ Unique to your application

---

## 🚀 How to Update

### Step 1: Run SQL Script
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the contents of `scripts/update-admin-password.sql`
3. Paste and run the script
4. Verify it shows `is_active = true`

### Step 2: Test New Password
1. Logout from admin dashboard (if logged in)
2. Go to admin login page
3. Enter:
   - Username: `admin`
   - Password: `PlounixAdmin2025!Secure#`
4. Should successfully login ✅

---

## 💡 Want a Different Password?

If you want to use a different password, here's how:

### Option 1: Generate via Node.js
```powershell
node -e "const bcrypt = require('bcryptjs'); const password = 'YourPasswordHere'; const hash = bcrypt.hashSync(password, 10); console.log('Password:', password); console.log('Hash:', hash);"
```

Then update the database:
```sql
UPDATE admin_credentials 
SET password_hash = 'paste_your_hash_here'
WHERE username = 'admin';
```

### Option 2: Use Online Bcrypt Generator
1. Go to: https://bcrypt-generator.com/
2. Enter your desired password
3. Use rounds: 10
4. Copy the generated hash
5. Run the SQL update above with your hash

---

## 🔒 Security Best Practices

### DO:
- ✅ Use a password manager to store this password
- ✅ Use a unique password not used elsewhere
- ✅ Include uppercase, lowercase, numbers, and symbols
- ✅ Make it at least 16 characters long
- ✅ Change password periodically

### DON'T:
- ❌ Don't use simple passwords like "admin123"
- ❌ Don't share admin password with untrusted users
- ❌ Don't store password in plain text
- ❌ Don't reuse passwords from other services
- ❌ Don't commit passwords to Git

---

## 📋 Password Requirements

For maximum security, admin passwords should have:
- **Minimum length**: 16 characters
- **Complexity**: Mix of uppercase, lowercase, numbers, symbols
- **Uniqueness**: Not used on any other service
- **Strength**: Use a password generator for best results

### Strong Password Examples:
- `Pl0un!x@Adm1n#2025$Secure`
- `MyApp$SuperSecure!Pass2025#`
- `Admin#Plounix@2025!Strong$`

---

## 🎯 Current Setup

**Current Admin Credentials:**
```
Username: admin
Password: PlounixAdmin2025!Secure#
```

**Password Hash in Database:**
```
$2b$10$N29NeeIEPJBGA.yra7FD9OEsoyC6elnB.etjd0f1xov4RfLR/L/6.
```

**To apply:** Run `scripts/update-admin-password.sql` in Supabase SQL Editor

---

## 🔄 Forgot Admin Password?

If you lose access, you can always generate a new password:

1. Generate new hash using Node.js (see "Option 1" above)
2. Directly update the database using Supabase dashboard:
   ```sql
   UPDATE admin_credentials 
   SET password_hash = 'your_new_hash'
   WHERE username = 'admin';
   ```
3. Test login with your new password

---

## ⚠️ Important Notes

- Password is hashed with bcrypt (cannot be reversed)
- Store this password securely (use password manager)
- Old password `admin123` will no longer work after update
- All existing admin sessions will remain valid until they expire (24 hours)

**Save this password in a secure location now!** 🔐
