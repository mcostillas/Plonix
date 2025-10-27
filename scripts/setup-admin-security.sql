-- Admin Security Setup SQL Script
-- Run this in your Supabase SQL Editor

-- ========================================
-- IMPORTANT: Admin Authentication System
-- ========================================
-- Admin login uses separate credentials (username/password)
-- NOT linked to regular user accounts
-- Default login: username='admin', password='admin123'
-- ========================================

-- ========================================
-- Step 1: Add is_active to admin_credentials
-- ========================================
ALTER TABLE admin_credentials 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ========================================
-- Step 2: Activate admin account(s)
-- ========================================
UPDATE admin_credentials 
SET is_active = true 
WHERE username = 'admin';

-- ========================================
-- Verification Queries (run these to check)
-- ========================================

-- Check admin credentials are active
SELECT username, email, is_active, last_login 
FROM admin_credentials 
WHERE username = 'admin';

-- ========================================
-- Optional: Create indexes for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_admin_credentials_username ON admin_credentials(username);
CREATE INDEX IF NOT EXISTS idx_admin_credentials_is_active ON admin_credentials(is_active);
