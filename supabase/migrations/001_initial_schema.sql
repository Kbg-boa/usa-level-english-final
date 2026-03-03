-- ============================================================================
-- MIGRATION 001: INITIAL SCHEMA + RLS POLICIES
-- USA Level English - Production-Grade Security
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: users_profile
-- ============================================================================

CREATE TABLE users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'free' CHECK (role IN ('free', 'premium', 'admin')),
  
  -- Rate limiting tracking
  daily_request_count INTEGER DEFAULT 0,
  last_request_reset TIMESTAMPTZ DEFAULT NOW(),
  total_requests INTEGER DEFAULT 0,
  
  -- Anti-abuse
  is_blocked BOOLEAN DEFAULT FALSE,
  suspicious_activity_score INTEGER DEFAULT 0,
  last_suspicious_activity TIMESTAMPTZ,
  
  -- Metadata
  display_name TEXT,
  avatar_url TEXT,
  fingerprint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_profile_role ON users_profile(role);
CREATE INDEX idx_users_profile_blocked ON users_profile(is_blocked);
CREATE INDEX idx_users_profile_fingerprint ON users_profile(fingerprint);

-- Enable RLS
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON users_profile FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile (restricted)"
  ON users_profile FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    -- Cannot change role or blocked status (only admins via Edge Functions)
    AND role = (SELECT role FROM users_profile WHERE id = auth.uid())
    AND is_blocked = (SELECT is_blocked FROM users_profile WHERE id = auth.uid())
  );

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profile (id, email, role)
  VALUES (NEW.id, NEW.email, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- TABLE 2: vocabulary
-- ============================================================================

CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'business', 'tech', 'daily', 'travel', 'food',
    'health', 'education', 'entertainment', 'sports', 'relationships'
  )),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('intermediate', 'advanced', 'native')),
  
  -- Rich content
  example_sentence TEXT,
  pronunciation TEXT,
  usage_notes TEXT,
  synonyms TEXT[],
  
  -- Access control
  min_role TEXT NOT NULL DEFAULT 'free' CHECK (min_role IN ('free', 'premium', 'admin')),
  
  -- Metadata
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vocabulary_category ON vocabulary(category);
CREATE INDEX idx_vocabulary_min_role ON vocabulary(min_role);
CREATE INDEX idx_vocabulary_difficulty ON vocabulary(difficulty);

-- Enable RLS
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view vocabulary they're authorized for
CREATE POLICY "Users view vocabulary based on role"
  ON vocabulary FOR SELECT
  USING (
    CASE 
      -- Admin sees everything
      WHEN (SELECT role FROM users_profile WHERE id = auth.uid()) = 'admin' THEN TRUE
      -- Premium sees free + premium
      WHEN (SELECT role FROM users_profile WHERE id = auth.uid()) = 'premium' 
        THEN min_role IN ('free', 'premium')
      -- Free sees only free tier
      WHEN (SELECT role FROM users_profile WHERE id = auth.uid()) = 'free' 
        THEN min_role = 'free'
      ELSE FALSE
    END
  );

-- ============================================================================
-- TABLE 3: quiz_questions
-- ============================================================================

CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answers TEXT[] NOT NULL CHECK (array_length(wrong_answers, 1) = 3),
  
  -- Categorization
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('intermediate', 'advanced', 'native')),
  
  -- Access control
  min_role TEXT NOT NULL DEFAULT 'premium' CHECK (min_role IN ('free', 'premium', 'admin')),
  
  -- Metadata
  times_answered INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quiz_category ON quiz_questions(category);
CREATE INDEX idx_quiz_min_role ON quiz_questions(min_role);

-- Enable RLS
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users view quiz based on role"
  ON quiz_questions FOR SELECT
  USING (
    CASE 
      WHEN (SELECT role FROM users_profile WHERE id = auth.uid()) = 'admin' THEN TRUE
      WHEN (SELECT role FROM users_profile WHERE id = auth.uid()) = 'premium' 
        THEN min_role IN ('free', 'premium')
      WHEN (SELECT role FROM users_profile WHERE id = auth.uid()) = 'free' 
        THEN min_role = 'free'
      ELSE FALSE
    END
  );

-- ============================================================================
-- TABLE 4: templates
-- ============================================================================

CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  
  -- Access control
  min_role TEXT NOT NULL DEFAULT 'premium' CHECK (min_role IN ('free', 'premium', 'admin')),
  
  -- Metadata
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_min_role ON templates(min_role);

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users view templates based on role"
  ON templates FOR SELECT
  USING (
    CASE 
      WHEN (SELECT role FROM users_profile WHERE id = auth.uid()) = 'admin' THEN TRUE
      WHEN (SELECT role FROM users_profile WHERE id = auth.uid()) = 'premium' 
        THEN min_role IN ('free', 'premium')
      WHEN (SELECT role FROM users_profile WHERE id = auth.uid()) = 'free' 
        THEN min_role = 'free'
      ELSE FALSE
    END
  );

-- ============================================================================
-- TABLE 5: rate_limiting_log
-- ============================================================================

CREATE TABLE rate_limiting_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  user_agent TEXT,
  response_status INTEGER,
  
  -- Anti-scraping detection
  is_suspicious BOOLEAN DEFAULT FALSE,
  suspicion_reasons TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_rate_limiting_user ON rate_limiting_log(user_id, created_at DESC);
CREATE INDEX idx_rate_limiting_ip ON rate_limiting_log(ip_address, created_at DESC);
CREATE INDEX idx_rate_limiting_endpoint ON rate_limiting_log(endpoint, created_at DESC);
CREATE INDEX idx_rate_limiting_suspicious ON rate_limiting_log(is_suspicious, created_at DESC);

-- Enable RLS (only admins can view logs)
ALTER TABLE rate_limiting_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins view rate limiting logs"
  ON rate_limiting_log FOR SELECT
  USING ((SELECT role FROM users_profile WHERE id = auth.uid()) = 'admin');

-- Auto-cleanup old logs (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_rate_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limiting_log 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLE 6: user_activity
-- ============================================================================

CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'word_learned', 'quiz_completed', 'lesson_started', 'template_used'
  )),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_activity_user ON user_activity(user_id, created_at DESC);
CREATE INDEX idx_user_activity_type ON user_activity(activity_type, created_at DESC);

-- Enable RLS
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own activity"
  ON user_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own activity"
  ON user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Get user role
CREATE OR REPLACE FUNCTION get_user_role(uid UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM users_profile WHERE id = uid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT COALESCE(is_blocked, FALSE) FROM users_profile WHERE id = uid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Increment request counter
CREATE OR REPLACE FUNCTION increment_request_count(uid UUID)
RETURNS void AS $$
BEGIN
  UPDATE users_profile 
  SET 
    daily_request_count = daily_request_count + 1,
    total_requests = total_requests + 1,
    updated_at = NOW()
  WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Reset daily counters (run via cron)
CREATE OR REPLACE FUNCTION reset_daily_counters()
RETURNS void AS $$
BEGIN
  UPDATE users_profile 
  SET 
    daily_request_count = 0,
    last_request_reset = NOW()
  WHERE last_request_reset < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANTS (Service Role only for Edge Functions)
-- ============================================================================

-- Revoke public access
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- Grant specific access via RLS policies
GRANT SELECT ON users_profile TO authenticated;
GRANT UPDATE ON users_profile TO authenticated;
GRANT SELECT ON vocabulary TO authenticated;
GRANT SELECT ON quiz_questions TO authenticated;
GRANT SELECT ON templates TO authenticated;
GRANT SELECT, INSERT ON user_activity TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users_profile IS 'User profiles with role-based access control';
COMMENT ON TABLE vocabulary IS 'Protected vocabulary database - 9000 words';
COMMENT ON TABLE quiz_questions IS 'Quiz questions - premium feature';
COMMENT ON TABLE templates IS 'Professional templates - premium feature';
COMMENT ON TABLE rate_limiting_log IS 'Anti-scraping and rate limiting logs';
COMMENT ON TABLE user_activity IS 'User engagement tracking';
