# Admin Security Testing Guide

## 🧪 How to Test the Security System

This guide explains how to test that the admin panel security is working correctly.

---

## Prerequisites

The application has two modes:

### DEV Mode (No Supabase)
- Any email/password works for testing
- Auto-grants super_admin role
- Uses localStorage for session

### PRODUCTION Mode (Supabase Connected)
- Real authentication required
- Role from users_extended table
- Only super_admin allowed

---

## Test Scenarios

### ✅ Test 1: Unauthorized Route Access

**Goal:** Verify that accessing admin routes without login is blocked.

**Steps:**
1. Clear browser localStorage: `localStorage.clear()`
2. Navigate to: `http://localhost:5173/admin/dashboard`
3. **Expected Result:**
   - Should see "Access Denied" screen
   - Message: "Access denied - Please login"
   - Auto-redirect to `/admin/login` after 2 seconds

**Console Output:**
```
No security errors (user not logged in yet)
```

---

### ✅ Test 2: DEV Mode Login (Any Credentials)

**Goal:** Verify that DEV mode accepts any credentials and grants super_admin.

**Steps:**
1. Make sure Supabase is NOT configured:
   - No `VITE_SUPABASE_PROJECT_ID` in .env
   - No `VITE_SUPABASE_ANON_KEY` in .env
2. Navigate to: `http://localhost:5173/admin/login`
3. Enter any email: `test@test.com`
4. Enter any password: `test123`
5. Click "Sign In"

**Expected Result:**
- Login successful
- Redirect to `/admin/dashboard`
- See "SUPER ADMIN" badge in sidebar and header
- User info shows email entered
- Yellow "DEV MODE" warning on login page

**Console Output:**
```
DEV MODE: Supabase not configured - Mock login
```

---

### ✅ Test 3: Wrong Role in DEV Mode (Manual Test)

**Goal:** Verify that non-super_admin roles are blocked.

**Steps:**
1. Login with any credentials (DEV mode)
2. Open browser DevTools Console
3. Manually change role in localStorage:
```javascript
const session = JSON.parse(localStorage.getItem('admin_session'));
session.user.role = 'admin'; // Change to 'admin' instead of 'super_admin'
localStorage.setItem('admin_session', JSON.stringify(session));
```
4. Refresh the page

**Expected Result:**
- Access denied immediately
- Message: "Access denied - Super Admin privileges required"
- localStorage session cleared
- Redirect to `/admin/login`

**Console Output:**
```
[SECURITY] Unauthorized access attempt - Role: admin | Required: super_admin
```

---

### ✅ Test 4: PRODUCTION Mode - Wrong Role

**Goal:** Verify that non-super_admin users cannot login in production.

**Prerequisites:**
- Supabase configured
- Database table `users_extended` exists
- User exists with `role = 'user'` or `role = 'admin'`

**Steps:**
1. Navigate to: `http://localhost:5173/admin/login`
2. Enter email of user with non-super_admin role
3. Enter correct password
4. Click "Sign In"

**Expected Result:**
- Login FAILS
- Error message: "Access denied - Super Admin privileges required"
- User is signed out from Supabase
- Stays on login page

**Console Output:**
```
Login error: Access denied - Super Admin privileges required
```

---

### ✅ Test 5: PRODUCTION Mode - Blocked Account

**Goal:** Verify that blocked accounts cannot login.

**Prerequisites:**
- User exists with `is_blocked = true`

**Steps:**
1. Try to login with blocked user credentials
2. Click "Sign In"

**Expected Result:**
- Login FAILS
- Error message: "Account is blocked"
- User signed out
- Stays on login page

---

### ✅ Test 6: PRODUCTION Mode - Inactive Account

**Goal:** Verify that inactive accounts cannot login.

**Prerequisites:**
- User exists with `is_active = false`

**Steps:**
1. Try to login with inactive user credentials
2. Click "Sign In"

**Expected Result:**
- Login FAILS
- Error message: "Account is not active"
- User signed out
- Stays on login page

---

### ✅ Test 7: PRODUCTION Mode - Successful Super Admin Login

**Goal:** Verify that super_admin can login successfully.

**Prerequisites:**
- User exists with:
  - `role = 'super_admin'`
  - `is_active = true`
  - `is_blocked = false`

**Steps:**
1. Navigate to: `http://localhost:5173/admin/login`
2. Enter super_admin email
3. Enter correct password
4. Click "Sign In"

**Expected Result:**
- Login successful
- Redirect to `/admin/dashboard`
- See "SUPER ADMIN" badges (red) in:
  - Sidebar user section
  - Top header
- Dashboard loads with all data
- Can access all admin pages:
  - Dashboard
  - Users
  - Analytics
  - Security
  - Messages
  - Content

---

### ✅ Test 8: Session Persistence

**Goal:** Verify that session persists across page refreshes.

**Steps:**
1. Login as super_admin (DEV or PROD)
2. Navigate to `/admin/users`
3. Refresh the page
4. Navigate to `/admin/security`
5. Refresh the page

**Expected Result:**
- Should stay logged in
- No redirect to login
- User info still visible
- SUPER ADMIN badges still showing

**DEV Mode:**
- Session in localStorage persists

**PRODUCTION Mode:**
- Supabase session persists
- Auto-refreshes tokens

---

### ✅ Test 9: Logout

**Goal:** Verify that logout clears session properly.

**Steps:**
1. Login as super_admin
2. Click "Logout" button in sidebar
3. Try to navigate to `/admin/dashboard`

**Expected Result:**
- Redirected to `/admin/login`
- Session cleared (localStorage or Supabase)
- Cannot access admin routes anymore

---

### ✅ Test 10: Multiple Tab Security

**Goal:** Verify that logout in one tab affects other tabs.

**Steps:**
1. Login as super_admin
2. Open `/admin/dashboard` in Tab 1
3. Open `/admin/users` in Tab 2
4. In Tab 1, click "Logout"
5. In Tab 2, try to navigate to another admin page

**Expected Result:**
- Tab 2 should detect session is gone
- Should show "Access Denied" on next navigation
- Should redirect to login

---

## Visual Security Indicators

### Login Page
- "🔒 Super Admin Access Only" notice
- "⚠️ DEV MODE" warning when Supabase not configured
- Clear error messages on failed login

### Admin Dashboard
- **Red "SUPER ADMIN" badge** in sidebar
- **Red "SUPER ADMIN" badge** in header
- User email displayed
- Role verification visible

---

## Database Setup for Production Testing

To test in PRODUCTION mode, create test users:

```sql
-- Super Admin User (SHOULD WORK)
INSERT INTO users_extended (id, email, full_name, role, is_active, is_blocked)
VALUES (
  'auth-user-id-1',
  'superadmin@test.com',
  'Super Admin User',
  'super_admin',
  true,
  false
);

-- Regular Admin User (SHOULD BE BLOCKED)
INSERT INTO users_extended (id, email, full_name, role, is_active, is_blocked)
VALUES (
  'auth-user-id-2',
  'admin@test.com',
  'Regular Admin',
  'admin',
  true,
  false
);

-- Regular User (SHOULD BE BLOCKED)
INSERT INTO users_extended (id, email, full_name, role, is_active, is_blocked)
VALUES (
  'auth-user-id-3',
  'user@test.com',
  'Regular User',
  'user',
  true,
  false
);

-- Blocked Super Admin (SHOULD BE BLOCKED)
INSERT INTO users_extended (id, email, full_name, role, is_active, is_blocked)
VALUES (
  'auth-user-id-4',
  'blocked@test.com',
  'Blocked Admin',
  'super_admin',
  true,
  true
);

-- Inactive Super Admin (SHOULD BE BLOCKED)
INSERT INTO users_extended (id, email, full_name, role, is_active, is_blocked)
VALUES (
  'auth-user-id-5',
  'inactive@test.com',
  'Inactive Admin',
  'super_admin',
  false,
  false
);
```

---

## Expected Console Security Logs

### Unauthorized Access Attempt
```
[SECURITY] Unauthorized access attempt - Role: admin | Required: super_admin
```

### Production Role Check Failed
```
[SECURITY] Unauthorized access attempt - User ID: xxx | Role: user | Required: super_admin
```

### Login Error
```
Login error: Access denied - Super Admin privileges required
```

---

## Security Checklist

- [ ] Non-authenticated users cannot access /admin routes
- [ ] Users with role !== 'super_admin' are blocked
- [ ] Blocked accounts (is_blocked = true) cannot login
- [ ] Inactive accounts (is_active = false) cannot login
- [ ] Session cleared on security violation
- [ ] Logout works properly in DEV and PROD
- [ ] Visual SUPER ADMIN badges visible
- [ ] DEV MODE warning shown when appropriate
- [ ] Console security logs working
- [ ] No hardcoded admin credentials

---

## Summary

The admin panel has **multi-layer security** that verifies:
1. ✅ Authentication (logged in)
2. ✅ Authorization (super_admin role)
3. ✅ Account status (active, not blocked)
4. ✅ Session validity (continuous checks)

Only users with `role = 'super_admin'` can access the admin dashboard.
