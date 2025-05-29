# Blog Backend API

A secure Node.js backend API for a blog application with Supabase integration. The API includes authentication, image uploads, and CRUD operations for posts and categories.

## Features

- User authentication (register, login, profile management)
- Post management with image uploads
- Category management
- Role-based access control (admin and regular users)
- Supabase integration for data storage

## Security Features

- JWT authentication with refresh tokens
- HTTP-only cookies for refresh tokens
- Password strength validation
- Brute force protection with rate limiting
- Account lockout after failed login attempts
- XSS protection via input sanitization
- NoSQL injection protection
- CSRF protection
- Secure HTTP headers with Helmet
- Request size limitations
- Parameter pollution protection

## Prerequisites

- Node.js (v14 or later)
- A Supabase account and project
- Git

## Setup

1. Clone the repository
```
git clone <repository-url>
cd backend
```

2. Install dependencies
```
npm install
```

3. Set up your Supabase project
   - Create a new project at [Supabase](https://supabase.com)
   - Create the following tables:
     - `users` (id, email, password, name, role, refresh_token, failed_login_attempts, last_login, last_failed_login, created_at)
     - `categories` (id, name, created_at)
     - `posts` (id, title, content, user_id, category_id, image_url, created_at)

4. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_token_secret_change_in_production

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# Upload Configuration
UPLOAD_PATH=uploads

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

5. Start the server
```
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get the current user's profile (requires authentication)
- `PUT /api/auth/profile` - Update the current user's profile (requires authentication)
- `POST /api/auth/logout` - Logout a user (requires authentication)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get a single category
- `POST /api/categories` - Create a new category (requires admin role)
- `PUT /api/categories/:id` - Update a category (requires admin role)
- `DELETE /api/categories/:id` - Delete a category (requires admin role)

### Posts
- `GET /api/posts` - Get all posts (supports pagination, filtering by category, and search)
- `GET /api/posts/:id` - Get a single post
- `POST /api/posts` - Create a new post (requires authentication)
- `PUT /api/posts/:id` - Update a post (requires authentication and ownership)
- `DELETE /api/posts/:id` - Delete a post (requires authentication and ownership)

## Security Best Practices

1. **Password Security**
   - Passwords must have minimum 8 characters
   - Must include uppercase and lowercase letters
   - Must include at least one number and one special character
   - Passwords are hashed using bcrypt with 12 rounds of salting

2. **Authentication**
   - JWT tokens with short expiration (24h)
   - Refresh tokens stored in HTTP-only cookies
   - Account lockout after 5 failed login attempts (30 minute lockout)

3. **API Security**
   - Rate limiting to prevent brute force attacks
   - Input validation and sanitization
   - XSS protection
   - Parameter pollution protection
   - Secure HTTP headers

## File Uploads

For post creation and updates, images can be uploaded using form-data with the field name `image`.

## License

ISC 