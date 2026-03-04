-- ============================================================================
-- MIGRATION 002: ADMIN DASHBOARD
-- Création de toutes les tables pour le dashboard admin complet
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE (avec rôles)
-- ============================================================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table users étendue
CREATE TABLE IF NOT EXISTS users_extended (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  is_blocked BOOLEAN DEFAULT false,
  blocked_reason TEXT,
  country TEXT,
  language TEXT DEFAULT 'en',
  timezone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  profile_data JSONB DEFAULT '{}'::jsonb
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users_extended(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users_extended(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users_extended(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users_extended(created_at);

-- ============================================================================
-- 2. USER SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users_extended(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE,
  ip_address INET,
  user_agent TEXT,
  country TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  pages_visited INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON user_sessions(is_active);

-- ============================================================================
-- 3. USER ACTIVITY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users_extended(id) ON DELETE CASCADE,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'lesson_started', 'lesson_completed', 'vocabulary_practiced',
    'exercise_completed', 'page_visited', 'feature_used'
  )),
  activity_data JSONB DEFAULT '{}'::jsonb,
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON user_activity(created_at);

-- ============================================================================
-- 4. ANALYTICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users_extended(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  page_url TEXT,
  referrer TEXT,
  ip_address INET,
  country TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);

-- ============================================================================
-- 5. SECURITY LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users_extended(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'failed_login', 'suspicious_ip', 'rate_limit_exceeded',
    'bot_detected', 'unauthorized_access', 'account_locked'
  )),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ip_address INET NOT NULL,
  user_agent TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES users_extended(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON security_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_is_resolved ON security_logs(is_resolved);

-- ============================================================================
-- 6. ADMIN MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES users_extended(id) ON DELETE SET NULL,
  message_type TEXT NOT NULL CHECK (message_type IN (
    'announcement', 'notification', 'maintenance', 'alert'
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_users TEXT DEFAULT 'all' CHECK (target_users IN ('all', 'active', 'specific')),
  target_user_ids UUID[],
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_type ON admin_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_is_active ON admin_messages(is_active);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON admin_messages(created_at);

-- ============================================================================
-- 7. MESSAGE READS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS message_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES admin_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users_extended(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_reads_message ON message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user ON message_reads(user_id);

-- ============================================================================
-- 8. LESSONS TRACKING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users_extended(id) ON DELETE CASCADE,
  lesson_type TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  status TEXT DEFAULT 'started' CHECK (status IN ('started', 'in_progress', 'completed')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  score INTEGER,
  time_spent_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_status ON lesson_progress(status);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_type ON lesson_progress(lesson_type);

-- ============================================================================
-- 9. ADMIN AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users_extended(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON admin_audit_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON admin_audit_log(created_at);

-- ============================================================================
-- 10. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE users_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY users_select_own ON users_extended
  FOR SELECT USING (auth.uid()::uuid = id);

-- Policy: Users can update their own data (not role)
CREATE POLICY users_update_own ON users_extended
  FOR UPDATE USING (auth.uid()::uuid = id)
  WITH CHECK (
    auth.uid()::uuid = id 
    AND role = (SELECT role FROM users_extended WHERE id = auth.uid()::uuid)
  );

-- Policy: Only admins can view all users
CREATE POLICY users_select_admin ON users_extended
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_extended 
      WHERE id = auth.uid()::uuid 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policy: Only admins can insert/update/delete users
CREATE POLICY users_admin_all ON users_extended
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_extended 
      WHERE id = auth.uid()::uuid 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policy: Users can read their own sessions
CREATE POLICY sessions_select_own ON user_sessions
  FOR SELECT USING (user_id = auth.uid()::uuid);

-- Policy: Admins can read all sessions
CREATE POLICY sessions_select_admin ON user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_extended 
      WHERE id = auth.uid()::uuid 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policy: Users can read their own activity
CREATE POLICY activity_select_own ON user_activity
  FOR SELECT USING (user_id = auth.uid()::uuid);

-- Policy: Admins can read all activity
CREATE POLICY activity_select_admin ON user_activity
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_extended 
      WHERE id = auth.uid()::uuid 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policy: Only admins can read analytics
CREATE POLICY analytics_admin_only ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_extended 
      WHERE id = auth.uid()::uuid 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policy: Only admins can read security logs
CREATE POLICY security_logs_admin_only ON security_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_extended 
      WHERE id = auth.uid()::uuid 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policy: Users can read active messages
CREATE POLICY messages_select_active ON admin_messages
  FOR SELECT USING (is_active = true);

-- Policy: Admins can manage all messages
CREATE POLICY messages_admin_all ON admin_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_extended 
      WHERE id = auth.uid()::uuid 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policy: Users can read their own message reads
CREATE POLICY message_reads_select_own ON message_reads
  FOR SELECT USING (user_id = auth.uid()::uuid);

-- Policy: Users can insert their own message reads
CREATE POLICY message_reads_insert_own ON message_reads
  FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);

-- Policy: Users can read their own lesson progress
CREATE POLICY lesson_progress_select_own ON lesson_progress
  FOR SELECT USING (user_id = auth.uid()::uuid);

-- Policy: Users can manage their own lesson progress
CREATE POLICY lesson_progress_manage_own ON lesson_progress
  FOR ALL USING (user_id = auth.uid()::uuid);

-- Policy: Admins can read all lesson progress
CREATE POLICY lesson_progress_select_admin ON lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_extended 
      WHERE id = auth.uid()::uuid 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policy: Only admins can read audit log
CREATE POLICY audit_log_admin_only ON admin_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_extended 
      WHERE id = auth.uid()::uuid 
      AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- 11. FUNCTIONS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at for users_extended
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users_extended
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at for admin_messages
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON admin_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_sessions', COUNT(DISTINCT s.id),
    'total_lessons', COUNT(DISTINCT l.id),
    'completed_lessons', COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'completed'),
    'total_time_spent', COALESCE(SUM(l.time_spent_seconds), 0),
    'last_activity', MAX(a.created_at)
  ) INTO result
  FROM users_extended u
  LEFT JOIN user_sessions s ON s.user_id = u.id
  LEFT JOIN lesson_progress l ON l.user_id = u.id
  LEFT JOIN user_activity a ON a.user_id = u.id
  WHERE u.id = user_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get dashboard statistics (admin only)
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Verify admin role
  IF NOT EXISTS (
    SELECT 1 FROM users_extended 
    WHERE id = auth.uid()::uuid 
    AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM users_extended),
    'active_users', (SELECT COUNT(*) FROM users_extended WHERE is_active = true),
    'active_users_today', (
      SELECT COUNT(DISTINCT user_id) 
      FROM user_activity 
      WHERE created_at >= CURRENT_DATE
    ),
    'total_sessions', (SELECT COUNT(*) FROM user_sessions),
    'active_sessions', (SELECT COUNT(*) FROM user_sessions WHERE is_active = true),
    'total_lessons_completed', (
      SELECT COUNT(*) 
      FROM lesson_progress 
      WHERE status = 'completed'
    ),
    'lessons_completed_today', (
      SELECT COUNT(*) 
      FROM lesson_progress 
      WHERE status = 'completed' 
      AND completed_at >= CURRENT_DATE
    ),
    'top_countries', (
      SELECT json_agg(json_build_object('country', country, 'count', count))
      FROM (
        SELECT country, COUNT(*) as count
        FROM users_extended
        WHERE country IS NOT NULL
        GROUP BY country
        ORDER BY count DESC
        LIMIT 5
      ) top
    ),
    'security_alerts', (
      SELECT COUNT(*) 
      FROM security_logs 
      WHERE is_resolved = false 
      AND created_at >= NOW() - INTERVAL '7 days'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 12. SEED DATA (Admin par défaut)
-- ============================================================================

-- Insert default admin (password must be set via Supabase Auth)
INSERT INTO users_extended (email, full_name, role, is_active)
VALUES 
  ('admin@usa-level-english.com', 'System Admin', 'super_admin', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE users_extended IS 'Extended user table with roles and admin features';
COMMENT ON TABLE user_sessions IS 'User session tracking for analytics';
COMMENT ON TABLE user_activity IS 'Detailed user activity log';
COMMENT ON TABLE analytics_events IS 'Analytics events for dashboard';
COMMENT ON TABLE security_logs IS 'Security monitoring and alerts';
COMMENT ON TABLE admin_messages IS 'Admin announcements and notifications';
COMMENT ON TABLE admin_audit_log IS 'Audit log for admin actions';
