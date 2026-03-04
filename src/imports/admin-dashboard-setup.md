I want to add a complete ADMIN DASHBOARD to manage my application.

Create a secure admin panel accessible only by admin users.

The admin panel must include the following sections:

1. Admin authentication

* Admin login page
* Only admin role can access /admin
* Use Supabase auth with role-based access (admin role)

2. Dashboard overview
   Show global statistics:

* Total users
* Active users today
* Total lessons completed
* Total sessions
* Top countries
* Recent activity

3. Users management
   Admin must be able to:

* View all users
* Search users
* Block or deactivate users
* Delete accounts
* See user activity and progress

4. Analytics
   Create analytics dashboard showing:

* Daily visitors
* Sessions
* Lessons usage
* Top pages
* Device types
* Countries

5. Security monitoring
   Create a security section showing:

* Suspicious IP addresses
* Failed login attempts
* Rate limit triggers
* Bot detection events

6. Messaging system
   Admin can send messages to users:

* Global announcements
* Notifications
* Maintenance alerts

7. Content management
   Admin can:

* Add vocabulary
* Edit lessons
* Delete content
* Manage vocabulary database

8. Admin interface
   Create these routes:

* /admin
* /admin/dashboard
* /admin/users
* /admin/analytics
* /admin/security
* /admin/messages
* /admin/content

Use:

* Supabase database
* Supabase RLS policies
* Secure API endpoints
* Admin role verification

Generate all required files and database tables.
