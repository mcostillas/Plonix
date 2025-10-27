-- Update Admin Password to Secure Unique Password
-- Run this in your Supabase SQL Editor

-- ========================================
-- IMPORTANT: New Admin Credentials
-- ========================================
-- Username: admin
-- Password: PlounixAdmin2025!Secure#
-- 
-- This password includes:
-- - Uppercase and lowercase letters
-- - Numbers
-- - Special characters (!#)
-- - 26 characters long
-- ========================================

-- Update the admin password
UPDATE admin_credentials 
SET password_hash = '$2b$10$N29NeeIEPJBGA.yra7FD9OEsoyC6elnB.etjd0f1xov4RfLR/L/6.',
    is_active = true
WHERE username = 'admin';

-- Verify the update
SELECT username, email, is_active, last_login, created_at
FROM admin_credentials 
WHERE username = 'admin';

-- ========================================
-- SAVE THIS PASSWORD SECURELY!
-- ========================================
-- New Password: PlounixAdmin2025!Secure#
-- ========================================
