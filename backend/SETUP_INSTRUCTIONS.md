# Setting Up Your Backend

Before running this backend, you need to set up a few things:

1. Create a `.env` file in the root directory with the following content:
```
PORT=5000
JWT_SECRET=your_super_secret_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_token_secret_change_in_production
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
UPLOAD_PATH=uploads
FRONTEND_URL=http://localhost:3000
```

2. Set up your Supabase tables:
   - **users**: id, email, password, name, role, refresh_token, failed_login_attempts, last_login, last_failed_login, created_at
   - **categories**: id, name, created_at
   - **posts**: id, title, content, user_id, category_id, image_url, created_at

3. Install dependencies:
```
npm install
```

4. Start the server:
```
npm run dev
```

The server will be available at http://localhost:5000. 