# Supabase Setup Instructions

Follow these steps to set up your Supabase project for this backend application:

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in or create an account
2. Create a new project
3. Choose a name and password for your project
4. Note your project URL and API keys (you'll need these for your `.env` file)

## 2. Set Up Database Tables Using SQL Editor

1. In your Supabase dashboard, navigate to the SQL Editor
2. Create a new query
3. Copy and paste the contents of the `supabase_setup.sql` file
4. Execute the query

The SQL script will:
- Create all necessary tables (users, categories, posts)
- Set up relationships between tables
- Configure row-level security policies
- Create triggers for automatic timestamp updates
- Add a default admin user and sample categories

## 3. Default Admin Credentials

After running the script, you'll have a default admin user:
- Email: admin@example.com
- Password: Admin123!

**IMPORTANT**: Change this password immediately in a production environment!

## 4. Configure Your .env File

Create a `.env` file in the root of your backend project with the following content:

```
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_token_secret_change_in_production

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Upload Configuration
UPLOAD_PATH=uploads

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

Replace `your_supabase_project_url` and `your_supabase_anon_key` with the values from your Supabase project settings.

## 5. Testing Your Setup

To verify that your setup is working correctly:

1. Start your backend server: `npm run dev`
2. Try logging in with the default admin credentials
3. Create a post with an image
4. Test all CRUD operations for categories and posts

## Troubleshooting

If you encounter any issues with the database setup:

1. Check that you have the `uuid-ossp` extension enabled in Supabase
2. Ensure your Supabase connection details in the `.env` file are correct
3. Verify that row-level security is properly configured
4. Check for any error messages in the SQL Editor when running the setup script 