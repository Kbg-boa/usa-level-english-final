// ============================================================================
// ADMIN ROUTES - Secure API for Admin Dashboard
// ============================================================================

import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js';

const app = new Hono();

// ============================================================================
// MIDDLEWARE: Verify Admin Role
// ============================================================================

async function verifyAdmin(c: any, next: any) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }

  // Check if user has admin role
  const { data: userData, error: userError } = await supabase
    .from('users_extended')
    .select('role, is_active, is_blocked')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    return c.json({ error: 'Unauthorized: User not found' }, 401);
  }

  if (!userData.is_active || userData.is_blocked) {
    return c.json({ error: 'Unauthorized: Account inactive or blocked' }, 401);
  }

  if (!['admin', 'super_admin'].includes(userData.role)) {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }

  // Store user info in context
  c.set('user', user);
  c.set('userRole', userData.role);

  await next();
}

// ============================================================================
// MIDDLEWARE: Log Admin Actions
// ============================================================================

async function logAdminAction(c: any, action: string, resourceType: string, resourceId?: string, data?: any) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const user = c.get('user');
  const ipAddress = c.req.header('x-forwarded-for') || c.req.header('x-real-ip');
  const userAgent = c.req.header('user-agent');

  await supabase.from('admin_audit_log').insert({
    admin_id: user.id,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    new_data: data,
    ip_address: ipAddress,
    user_agent: userAgent
  });
}

// ============================================================================
// ROUTE: GET Dashboard Statistics
// ============================================================================

app.get('/make-server-680c8781/admin/dashboard/stats', verifyAdmin, async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Call stored function for dashboard stats
    const { data, error } = await supabase.rpc('get_dashboard_stats');

    if (error) {
      console.error('Dashboard stats error:', error);
      return c.json({ error: 'Failed to fetch dashboard stats' }, 500);
    }

    return c.json({ success: true, stats: data });
  } catch (error) {
    console.error('Dashboard stats exception:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// ROUTE: GET All Users (with pagination and search)
// ============================================================================

app.get('/make-server-680c8781/admin/users', verifyAdmin, async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
    const search = c.req.query('search') || '';
    const role = c.req.query('role') || '';
    const isActive = c.req.query('is_active');

    let query = supabase
      .from('users_extended')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true');
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Users fetch error:', error);
      return c.json({ error: 'Failed to fetch users' }, 500);
    }

    return c.json({
      success: true,
      users: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Users fetch exception:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// ROUTE: GET User Details (with stats)
// ============================================================================

app.get('/make-server-680c8781/admin/users/:userId', verifyAdmin, async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const userId = c.req.param('userId');

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users_extended')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Fetch user stats
    const { data: stats, error: statsError } = await supabase
      .rpc('get_user_stats', { user_uuid: userId });

    // Fetch recent activity
    const { data: recentActivity } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return c.json({
      success: true,
      user,
      stats: stats || {},
      recentActivity: recentActivity || []
    });
  } catch (error) {
    console.error('User details exception:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// ROUTE: UPDATE User (block, activate, change role)
// ============================================================================

app.patch('/make-server-680c8781/admin/users/:userId', verifyAdmin, async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const userId = c.req.param('userId');
    const body = await c.req.json();

    const { is_active, is_blocked, blocked_reason, role } = body;

    // Only super_admin can change roles
    const userRole = c.get('userRole');
    if (role && userRole !== 'super_admin') {
      return c.json({ error: 'Forbidden: Only super_admin can change roles' }, 403);
    }

    const updateData: any = {};
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_blocked !== undefined) updateData.is_blocked = is_blocked;
    if (blocked_reason) updateData.blocked_reason = blocked_reason;
    if (role) updateData.role = role;

    const { data, error } = await supabase
      .from('users_extended')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('User update error:', error);
      return c.json({ error: 'Failed to update user' }, 500);
    }

    // Log admin action
    await logAdminAction(c, 'update_user', 'user', userId, updateData);

    return c.json({ success: true, user: data });
  } catch (error) {
    console.error('User update exception:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// ROUTE: DELETE User
// ============================================================================

app.delete('/make-server-680c8781/admin/users/:userId', verifyAdmin, async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const userId = c.req.param('userId');
    const userRole = c.get('userRole');

    // Only super_admin can delete users
    if (userRole !== 'super_admin') {
      return c.json({ error: 'Forbidden: Only super_admin can delete users' }, 403);
    }

    const { error } = await supabase
      .from('users_extended')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('User delete error:', error);
      return c.json({ error: 'Failed to delete user' }, 500);
    }

    // Log admin action
    await logAdminAction(c, 'delete_user', 'user', userId);

    return c.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('User delete exception:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// ROUTE: GET Analytics (daily visitors, sessions, etc.)
// ============================================================================

app.get('/make-server-680c8781/admin/analytics', verifyAdmin, async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const days = parseInt(c.req.query('days') || '7');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily visitors
    const { data: dailyVisitors } = await supabase
      .from('analytics_events')
      .select('created_at, user_id')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Sessions by device
    const { data: deviceStats } = await supabase
      .from('user_sessions')
      .select('device_type')
      .gte('started_at', startDate.toISOString());

    // Top pages
    const { data: topPages } = await supabase
      .from('analytics_events')
      .select('page_url')
      .gte('created_at', startDate.toISOString())
      .not('page_url', 'is', null);

    // Countries
    const { data: countries } = await supabase
      .from('user_sessions')
      .select('country')
      .gte('started_at', startDate.toISOString())
      .not('country', 'is', null);

    // Process data
    const dailyVisitorsMap = new Map();
    dailyVisitors?.forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      if (!dailyVisitorsMap.has(date)) {
        dailyVisitorsMap.set(date, new Set());
      }
      if (event.user_id) {
        dailyVisitorsMap.get(date).add(event.user_id);
      }
    });

    const dailyVisitorsData = Array.from(dailyVisitorsMap.entries()).map(([date, users]) => ({
      date,
      visitors: users.size
    }));

    const deviceCounts = deviceStats?.reduce((acc: any, { device_type }) => {
      acc[device_type || 'unknown'] = (acc[device_type || 'unknown'] || 0) + 1;
      return acc;
    }, {});

    const pageCounts = topPages?.reduce((acc: any, { page_url }) => {
      acc[page_url] = (acc[page_url] || 0) + 1;
      return acc;
    }, {});

    const topPagesData = Object.entries(pageCounts || {})
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 10)
      .map(([url, count]) => ({ url, count }));

    const countryCounts = countries?.reduce((acc: any, { country }) => {
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    const topCountries = Object.entries(countryCounts || {})
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }));

    return c.json({
      success: true,
      analytics: {
        dailyVisitors: dailyVisitorsData,
        devices: deviceCounts,
        topPages: topPagesData,
        topCountries
      }
    });
  } catch (error) {
    console.error('Analytics exception:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// ROUTE: GET Security Logs
// ============================================================================

app.get('/make-server-680c8781/admin/security/logs', verifyAdmin, async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
    const severity = c.req.query('severity');
    const eventType = c.req.query('event_type');
    const isResolved = c.req.query('is_resolved');

    let query = supabase
      .from('security_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (severity) query = query.eq('severity', severity);
    if (eventType) query = query.eq('event_type', eventType);
    if (isResolved !== undefined) query = query.eq('is_resolved', isResolved === 'true');

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Security logs error:', error);
      return c.json({ error: 'Failed to fetch security logs' }, 500);
    }

    return c.json({
      success: true,
      logs: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Security logs exception:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// ROUTE: CREATE Admin Message
// ============================================================================

app.post('/make-server-680c8781/admin/messages', verifyAdmin, async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const user = c.get('user');
    const body = await c.req.json();

    const { message_type, title, content, target_users, target_user_ids, priority, expires_at } = body;

    if (!title || !content || !message_type) {
      return c.json({ error: 'Missing required fields: title, content, message_type' }, 400);
    }

    const { data, error } = await supabase
      .from('admin_messages')
      .insert({
        created_by: user.id,
        message_type,
        title,
        content,
        target_users: target_users || 'all',
        target_user_ids,
        priority: priority || 'normal',
        expires_at
      })
      .select()
      .single();

    if (error) {
      console.error('Message create error:', error);
      return c.json({ error: 'Failed to create message' }, 500);
    }

    // Log admin action
    await logAdminAction(c, 'create_message', 'message', data.id, body);

    return c.json({ success: true, message: data });
  } catch (error) {
    console.error('Message create exception:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// ROUTE: GET Admin Messages
// ============================================================================

app.get('/make-server-680c8781/admin/messages', verifyAdmin, async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data, error } = await supabase
      .from('admin_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Messages fetch error:', error);
      return c.json({ error: 'Failed to fetch messages' }, 500);
    }

    return c.json({ success: true, messages: data });
  } catch (error) {
    console.error('Messages fetch exception:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// ROUTE: GET Audit Log
// ============================================================================

app.get('/make-server-680c8781/admin/audit-log', verifyAdmin, async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);

    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('admin_audit_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Audit log error:', error);
      return c.json({ error: 'Failed to fetch audit log' }, 500);
    }

    return c.json({
      success: true,
      logs: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Audit log exception:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
