-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  refresh_token TEXT,
  failed_login_attempts INTEGER DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE,
  last_failed_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to users table
DROP TRIGGER IF EXISTS set_timestamp_users ON public.users;
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add trigger to categories table
DROP TRIGGER IF EXISTS set_timestamp_categories ON public.categories;
CREATE TRIGGER set_timestamp_categories
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add trigger to posts table
DROP TRIGGER IF EXISTS set_timestamp_posts ON public.posts;
CREATE TRIGGER set_timestamp_posts
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Create a default admin user (change password in production!)
INSERT INTO public.users (email, password, name, role, status)
VALUES ('admin@example.com', '$2b$12$Zql8oCNYA6tFEGecOFa6AuJ7dJUxcgIHzfB5zO.SklTN.Oa/MWCYe', 'Admin User', 'admin', 'approved')
ON CONFLICT (email) DO NOTHING;

-- Create some default categories if they don't exist
INSERT INTO public.categories (name)
VALUES ('Technology'), ('Health'), ('Business'), ('Entertainment'), ('Education')
ON CONFLICT (name) DO NOTHING; 