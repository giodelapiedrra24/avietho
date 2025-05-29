# User Approval System Update

This update adds a user approval system to the application. By default, new users will need admin approval before they can log in.

## Database Update Instructions

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the `update_user_status.sql` file
5. Execute the query

## How the Approval System Works

1. When a new user registers, their account is set to 'pending' status by default
2. Users with 'pending' status cannot log in until an admin approves their account
3. Admins can view pending users at http://localhost:3000/admin/users
4. Admins can approve or reject users from this page
5. Once approved, users can log in normally

## Special Cases

- Admin users are automatically approved
- The user with email 'giodelapiedra24@gmail.com' is automatically made an admin and approved
- The default admin user (admin@example.com) is already approved

## Testing the System

1. Register a new user account
2. Try to log in with the new account - you should see a message saying your account is pending approval
3. Log in as an admin
4. Go to the user management page
5. Approve the new user
6. The new user should now be able to log in 