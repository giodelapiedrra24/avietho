# Pag-setup ng Direct Supabase Connection mula sa Frontend

Ang guide na ito ay magtuturo kung paano direktang gamitin ang Supabase mula sa iyong React frontend application, na ideal para sa shared hosting tulad ng Hostinger kung saan maaaring limitado ang Node.js support.

## 1. Overview ng Architecture

Sa setup na ito:
- Ang React frontend ay i-host sa Hostinger shared hosting
- Direktang mag-connect sa Supabase para sa lahat ng backend functionality
- Wala nang separate Express.js backend server

```
┌─────────────┐         ┌─────────────┐
│             │         │             │
│  React App  │ ───────►│  Supabase   │
│ (Hostinger) │         │  Services   │
│             │         │             │
└─────────────┘         └─────────────┘
```

## 2. I-setup ang Supabase Client sa Frontend

1. **I-install ang Supabase client library**:

```bash
cd frontend
npm install @supabase/supabase-js
```

2. **Gumawa ng Supabase client file** sa `src/services/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## 3. I-setup ang Authentication

1. **Gumawa ng authentication service** sa `src/services/auth.js`:

```javascript
import { supabase } from './supabase';

export const authService = {
  // Login with email and password
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },
  
  // Register a new user
  async register(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) throw error;
    return data;
  },
  
  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  
  // Get session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
};
```

## 4. I-setup ang Data Access Methods

1. **Gumawa ng data service para sa posts** sa `src/services/posts.js`:

```javascript
import { supabase } from './supabase';

export const postService = {
  // Get all posts
  async getAllPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*, categories(*), user:users(*)')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },
  
  // Get a single post
  async getPostById(id) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, categories(*), user:users(*)')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Create a post
  async createPost(postData) {
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Update a post
  async updatePost(id, postData) {
    const { data, error } = await supabase
      .from('posts')
      .update(postData)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Delete a post
  async deletePost(id) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  }
};
```

2. **Gumawa ng category service** sa `src/services/categories.js`:

```javascript
import { supabase } from './supabase';

export const categoryService = {
  // Get all categories
  async getAllCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data;
  },
  
  // Create category (admin only)
  async createCategory(categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Update category
  async updateCategory(id, categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Delete category
  async deleteCategory(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  }
};
```

## 5. I-setup ang File Upload sa Supabase Storage

1. **Gumawa ng storage service** sa `src/services/storage.js`:

```javascript
import { supabase } from './supabase';

export const storageService = {
  // Upload a file
  async uploadFile(file, folder = 'posts') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file);
      
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);
      
    return urlData.publicUrl;
  },
  
  // Delete a file
  async deleteFile(filePath) {
    // Extract path from URL
    const path = filePath.split('uploads/')[1];
    
    if (!path) {
      throw new Error('Invalid file path');
    }
    
    const { error } = await supabase.storage
      .from('uploads')
      .remove([path]);
      
    if (error) throw error;
    return true;
  }
};
```

## 6. I-setup ang Authentication Context

1. **Gumawa ng Auth Context** sa `src/contexts/AuthContext.js`:

```javascript
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';
import { authService } from '../services/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      try {
        const session = await authService.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      const { user } = await authService.login(email, password);
      return user;
    } catch (error) {
      throw error;
    }
  };
  
  // Register function
  const register = async (email, password, metadata) => {
    try {
      const { user } = await authService.register(email, password, metadata);
      return user;
    } catch (error) {
      throw error;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      throw error;
    }
  };
  
  const value = {
    user,
    loading,
    login,
    register,
    logout
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
```

2. **I-wrap ang app sa Auth Provider** sa `src/index.js`:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
```

## 7. I-update ang React Components para Gamitin ang Direct Supabase Services

1. **Example ng Login Component**:

```javascript
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to log in: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-form">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
```

2. **Example ng Post List Component**:

```javascript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../services/posts';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await postService.getAllPosts();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="posts-container">
      <h2>Blog Posts</h2>
      <div className="posts-grid">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            {post.image_url && (
              <img src={post.image_url} alt={post.title} />
            )}
            <h3>{post.title}</h3>
            <p>Category: {post.categories.name}</p>
            <p>By: {post.user.name}</p>
            <Link to={`/posts/${post.id}`}>Read More</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostList;
```

## 8. I-deploy sa Hostinger

1. **I-update ang environment variables** sa `.env.production`:

```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

2. **Gumawa ng production build**:

```bash
npm run build
```

3. **I-upload ang build folder sa Hostinger** gamit ang File Manager o FTP

4. **I-add ang `.htaccess` file** para sa SPA routing (gaya ng nasa Hostinger deployment guide)

## 9. Security Considerations

1. **RLS (Row Level Security)** - Siguraduhin na maayos ang RLS policies sa Supabase
2. **Environment Variables** - Huwag i-expose ang sensitive keys sa frontend code
3. **Validation** - I-validate ang lahat ng user inputs sa client-side at sa Supabase RLS policies
4. **CORS** - I-ensure na ang domain mo ay allowed sa Supabase

## 10. Performance Optimizations

1. **Pagination** - I-implement ang pagination para sa lists ng data
2. **Caching** - I-consider ang client-side caching para sa frequently accessed data
3. **Image Optimization** - I-optimize ang images bago i-upload
4. **State Management** - I-consider ang paggamit ng React Query o SWR para sa efficient data fetching

---

Sa pamamagitan ng direct Supabase connection approach na ito, makakagawa ka ng full-featured web application na hosted sa Hostinger shared hosting kahit walang Node.js backend. Ito ay efficient at cost-effective solution para sa mga medium-sized applications. 