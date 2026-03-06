# Database Schema Requirements for Production Analytics

⚠️ **IMPORTANT**: These tables need to be created manually in Supabase Dashboard.
We cannot run migrations or DDL statements from the Make environment.

## Required Tables

### 1. analytics_events

Track all page views and user activity.

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  page_path TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_page_path ON analytics_events(page_path);
```

### 2. security_logs

Track security events, failed logins, and suspicious activity.

```sql
CREATE TABLE security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_security_logs_created_at ON security_logs(created_at DESC);
CREATE INDEX idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX idx_security_logs_email ON security_logs(email);
```

### 3. announcements

Admin messages to users.

```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Index
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX idx_announcements_is_active ON announcements(is_active);
```

### 4. Verify users_extended table exists

Should already exist with these columns:

```sql
-- Verify this table exists with all required columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users_extended';

-- Required columns:
-- id (uuid)
-- email (text)
-- full_name (text)
-- role (text)
-- is_active (boolean)
-- is_blocked (boolean)
-- blocked_reason (text)
-- country (text)
-- last_login_at (timestamptz)
-- login_count (integer)
-- created_at (timestamptz)
```

## Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Analytics Events - Allow authenticated users to insert their own events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own analytics"
ON analytics_events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all analytics"
ON analytics_events FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_extended
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Security Logs - Only admins can read
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view security logs"
ON security_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_extended
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Anyone can insert security logs"
ON security_logs FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active announcements"
ON announcements FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Only admins can create announcements"
ON announcements FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users_extended
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);
```

## How to Create These Tables

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste each CREATE TABLE statement
3. Run them one by one
4. Apply the RLS policies
5. Verify tables exist in Table Editor

## After Creating Tables

The analytics system will automatically start tracking:
- Page views
- User sessions
- Security events
- Admin announcements

The admin dashboard will show real data from these tables.
