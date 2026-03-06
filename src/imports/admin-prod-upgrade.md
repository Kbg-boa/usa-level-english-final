We need to upgrade the Admin system to production-level with real data and real analytics.

Right now the admin UI works, authentication works, but many values inside the admin dashboard are still using mock or static data. We need to replace everything with real Supabase data and add a full analytics tracking system.

Please implement the following improvements:

1️⃣ Global Analytics Tracking System

Create a tracking system that records real user activity.

Create a Supabase table:

analytics_events

Columns:

id (uuid, primary key)

event_type (text)

page_path (text)

user_id (uuid, nullable)

user_email (text, nullable)

user_agent (text)

created_at (timestamp default now())

Then create a file:

src/lib/analytics.ts

This file should export a function:

trackPageView(path)

It should:

get the Supabase session
read user id and email if available
insert a record in analytics_events
store user_agent
store page_path

2️⃣ Track Every Page Visit

Integrate tracking globally in the application.

In the Root layout or App layout component:

Use react-router useLocation()

When location.pathname changes:

call trackPageView(location.pathname)

This will automatically track all page views across the entire app.

3️⃣ Replace All Mock Data In Admin

Search for any mock data in:

Dashboard.tsx
Analytics.tsx
Users.tsx
Security.tsx
Messages.tsx

Remove all hardcoded stats like:

totalUsers: 1247
activeUsers: 98

Replace them with real Supabase queries.

Examples:

Total Users → count from users_extended

Active users today → analytics_events today

Total visits → count analytics_events

Last logins → users_extended.last_login_at

4️⃣ Build Real Analytics Dashboard

The Admin Analytics page should display:

Total visitors today
Visitors this week
Most visited pages
User agents / devices
Timeline of visits (chart)

Use Recharts if needed.

Data source: analytics_events

5️⃣ Admin User Management Improvements

Improve Users.tsx to show real data from:

users_extended

Columns:

email
role
is_active
is_blocked
last_login_at
login_count

Admin should be able to:

block user
activate/deactivate user
promote to admin
see last login

6️⃣ Security Monitoring

Improve Security.tsx:

Track:

failed logins
admin login attempts
blocked users
suspicious activity

Create table:

security_logs

Columns:

id
event_type
email
ip_address
user_agent
created_at

Log failed admin logins automatically.

7️⃣ Messaging System

Improve Messages.tsx:

Allow admin to send announcements to users.

Create table:

announcements

Columns:

id
title
message
created_at
created_by

Show announcements in the app dashboard for users.

8️⃣ Performance and Monitoring

Add metrics in admin dashboard:

Total registered users
Active users today
Page views today
Total lessons completed (if available)

Add charts for:

daily activity
user growth
page traffic

9️⃣ Production Quality

Requirements:

No mock data anywhere
All data must come from Supabase
All queries must use the Supabase client already in the project
Do not break existing admin authentication logic
Keep super_admin role protection

10️⃣ Final Result

After implementation the admin must show:

real user numbers
real page visits
real activity analytics
real user list
real security events

The admin panel should become a real monitoring dashboard for the application.

Focus on clean architecture and production-ready implementation.
