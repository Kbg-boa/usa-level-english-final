# Admin Setup Guide

## 🚀 How to Create Your First Super Admin

This guide explains how to set up your first super admin account to access the admin dashboard.

---

## DEV Mode (Local Testing)

### No Setup Required! 🎉

In DEV mode (when Supabase is not configured), you can use **any credentials** to login and the system will automatically grant you super_admin access.

**Steps:**
1. Start your app: `npm run dev`
2. Go to: `http://localhost:5173/admin/login`
3. Enter any email: `test@test.com`
4. Enter any password: `test123`
5. Click "Sign In"
6. ✅ You're in! Full admin access granted.

**Note:** You'll see a yellow "DEV MODE" warning on the login page.

---

## PRODUCTION Mode (Supabase Connected)

### Step 1: Create User in Supabase Auth

First, create a user account using Supabase Auth:

**Option A: Via Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Click "Authentication" → "Users"
3. Click "Add User"
4. Enter email: `admin@yourdomain.com`
5. Enter password: `your-secure-password`
6. Click "Create User"
7. Copy the user's UUID (e.g., `d1f2e3c4-5b6a-7c8d-9e0f-1a2b3c4d5e6f`)

**Option B: Via SQL**
```sql
-- This will create an auth user with email confirmed
SELECT auth.create_user(
  email := 'admin@yourdomain.com',
  password := 'your-secure-password',
  email_confirm := true
);
```

---

### Step 2: Add User to users_extended Table

Now grant super_admin role to this user in the `users_extended` table:

```sql
-- Replace 'USER_UUID_HERE' with the actual user ID from Step 1
INSERT INTO users_extended (
  id,
  email,
  full_name,
  role,
  is_active,
  is_blocked,
  created_at,
  updated_at
) VALUES (
  'USER_UUID_HERE',  -- Replace with actual user UUID from auth.users
  'admin@yourdomain.com',
  'Super Admin',
  'super_admin',     -- CRITICAL: Must be 'super_admin'
  true,              -- Account is active
  false,             -- Account is not blocked
  NOW(),
  NOW()
);
```

**Example with real UUID:**
```sql
INSERT INTO users_extended (
  id,
  email,
  full_name,
  role,
  is_active,
  is_blocked,
  created_at,
  updated_at
) VALUES (
  'd1f2e3c4-5b6a-7c8d-9e0f-1a2b3c4d5e6f',
  'admin@yourdomain.com',
  'John Doe',
  'super_admin',
  true,
  false,
  NOW(),
  NOW()
);
```

---

### Step 3: Verify Setup

Check that everything is correct:

```sql
-- Verify the user exists with correct role
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  is_blocked
FROM users_extended
WHERE role = 'super_admin';
```

**Expected Result:**
```
id                                   | email                  | full_name   | role         | is_active | is_blocked
-------------------------------------|------------------------|-------------|--------------|-----------|------------
d1f2e3c4-5b6a-7c8d-9e0f-1a2b3c4d5e6f | admin@yourdomain.com   | John Doe    | super_admin  | true      | false
```

---

### Step 4: Test Login

1. Go to: `https://yourdomain.com/admin/login`
2. Enter email: `admin@yourdomain.com`
3. Enter password: `your-secure-password`
4. Click "Sign In"
5. ✅ Success! You should see the admin dashboard with "SUPER ADMIN" badges.

---

## Creating Additional Super Admins

To add more super admin users, repeat Steps 1-3 for each user.

**Quick SQL Template:**
```sql
-- 1. Create auth user (via Supabase dashboard or auth.create_user)
-- 2. Get the user UUID
-- 3. Add to users_extended:

INSERT INTO users_extended (
  id,
  email,
  full_name,
  role,
  is_active,
  is_blocked,
  created_at,
  updated_at
) VALUES (
  'NEW_USER_UUID',
  'newadmin@yourdomain.com',
  'New Admin Name',
  'super_admin',
  true,
  false,
  NOW(),
  NOW()
);
```

---

## Security Best Practices

### ✅ DO:
- Use strong, unique passwords for super admin accounts
- Limit the number of super admin users (only trusted personnel)
- Regularly review who has super_admin access
- Use real email addresses that you control
- Enable 2FA on Supabase dashboard access

### ❌ DON'T:
- Don't use weak passwords like "password123"
- Don't share super admin credentials
- Don't create super admins for regular users
- Don't use generic emails like "admin@admin.com"
- Don't forget to set `is_active = true` and `is_blocked = false`

---

## Troubleshooting

### Problem: "Access denied - Super Admin privileges required"

**Solution:**
Check that the user has the correct role:
```sql
SELECT role FROM users_extended WHERE email = 'your@email.com';
```

If the role is NOT 'super_admin', update it:
```sql
UPDATE users_extended 
SET role = 'super_admin' 
WHERE email = 'your@email.com';
```

---

### Problem: "Account is blocked"

**Solution:**
```sql
UPDATE users_extended 
SET is_blocked = false 
WHERE email = 'your@email.com';
```

---

### Problem: "Account is not active"

**Solution:**
```sql
UPDATE users_extended 
SET is_active = true 
WHERE email = 'your@email.com';
```

---

### Problem: "User not found in database"

**Solution:**
The user exists in `auth.users` but not in `users_extended`. Run Step 2 again to add them.

---

### Problem: Cannot login even with correct credentials

**Checklist:**
1. ✅ User exists in `auth.users`
2. ✅ User exists in `users_extended`
3. ✅ `role = 'super_admin'` (not 'admin')
4. ✅ `is_active = true`
5. ✅ `is_blocked = false`
6. ✅ Password is correct

---

## Database Schema Reference

The `users_extended` table must have this structure:

```sql
CREATE TABLE users_extended (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Important Fields:**
- `id` - Must match UUID from auth.users
- `role` - Must be exactly 'super_admin' for admin access
- `is_active` - Must be true
- `is_blocked` - Must be false

---

## Quick Reference: Super Admin Setup Checklist

- [ ] Step 1: Create user in Supabase Auth
- [ ] Step 2: Copy user UUID
- [ ] Step 3: Insert into users_extended with role = 'super_admin'
- [ ] Step 4: Set is_active = true
- [ ] Step 5: Set is_blocked = false
- [ ] Step 6: Test login at /admin/login
- [ ] Step 7: Verify "SUPER ADMIN" badges appear
- [ ] Step 8: Test access to all admin pages

---

## Summary

**DEV Mode:**
- No setup needed
- Any credentials work
- Auto-grants super_admin

**PRODUCTION Mode:**
1. Create user in Supabase Auth
2. Add to users_extended with role = 'super_admin'
3. Ensure is_active = true and is_blocked = false
4. Login and enjoy full admin access

Only users with `role = 'super_admin'` can access the admin dashboard.
