const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { formatResponse } = require('../utils/helpers');
require('dotenv').config();

// Authenticate user
const authenticate = async (req, res, next) => {
  let token;

  // Check if token exists in headers or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Get token from cookie
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json(
      formatResponse(false, null, 'Not authorized to access this route', 401)
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-for-development');
    
    console.log('Auth middleware - decoded token:', decoded);

    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, status')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      console.error('Auth middleware - user not found:', error);
      return res.status(401).json(
        formatResponse(false, null, 'User not found or not authorized', 401)
      );
    }
    
    console.log('Auth middleware - found user:', user.email, 'role:', user.role, 'status:', user.status);
    
    // Special case for giodelapiedra24@gmail.com - always consider as admin
    if (user.email === 'giodelapiedra24@gmail.com') {
      console.log('Auth middleware - special case for giodelapiedra24@gmail.com');
      user.role = 'admin';
      // Update role in database if needed
      if (user.role !== 'admin') {
        try {
          console.log('Auth middleware - updating giodelapiedra24@gmail.com to admin');
          await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('email', 'giodelapiedra24@gmail.com');
        } catch (updateErr) {
          console.error('Error updating special user role:', updateErr);
        }
      }
    }

    // If user is not an admin and status field exists, check if they're approved
    if (user.role !== 'admin' && user.hasOwnProperty('status') && user.status !== 'approved') {
      console.log('Auth middleware - user not approved:', user.email, 'status:', user.status);
      return res.status(401).json(
        formatResponse(false, null, 'Your account is not approved', 401)
      );
    }

    // Add user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json(
        formatResponse(false, null, 'Token expired, please login again', 401)
      );
    }

    return res.status(401).json(
      formatResponse(false, null, 'Not authorized to access this route', 401)
    );
  }
};

// Authorize based on user role
const authorize = (role) => {
  return (req, res, next) => {
    console.log('Authorize middleware - checking role:', role, 'for user:', req.user?.email, 'current role:', req.user?.role);
    
    if (!req.user) {
      console.log('Authorize failed - no user in request');
      return res.status(401).json(
        formatResponse(false, null, 'User not authenticated', 401)
      );
    }
    
    // Special case for giodelapiedra24@gmail.com when admin role is required
    if (role === 'admin' && req.user.email === 'giodelapiedra24@gmail.com') {
      console.log('Authorize - special user giodelapiedra24@gmail.com granted access');
      req.user.role = 'admin'; // Ensure role is set to admin
      next();
      return;
    }

    if (req.user.role !== role) {
      console.log('Authorize failed - wrong role. Required:', role, 'User has:', req.user.role);
      return res.status(403).json(
        formatResponse(false, null, `Not authorized. Role '${role}' required.`, 403)
      );
    }
    
    console.log('Authorize passed for user:', req.user.email);
    next();
  };
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  console.log('Admin check middleware - user:', req.user?.email, 'role:', req.user?.role);
  
  if (!req.user) {
    console.log('Admin check failed - no user in request');
    return res.status(401).json(
      formatResponse(false, null, 'Authentication required', 401)
    );
  }
  
  // Special case for giodelapiedra24@gmail.com
  if (req.user.email === 'giodelapiedra24@gmail.com') {
    console.log('Admin check - special user giodelapiedra24@gmail.com granted access');
    req.user.role = 'admin'; // Ensure role is set to admin
    next();
    return;
  }
  
  if (req.user.role === 'admin') {
    console.log('Admin check passed for user:', req.user.email);
    next();
  } else {
    console.log('Admin check failed - user is not admin:', req.user.email, 'role:', req.user.role);
    return res.status(403).json(
      formatResponse(false, null, 'Access denied: admin permission required', 403)
    );
  }
};

// Check if user owns resource or is admin
const resourceOwnerOrAdmin = (userId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.id === userId || req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied: not the resource owner' });
    }
  };
};

module.exports = { 
  authenticate,
  authorize,
  adminOnly,
  resourceOwnerOrAdmin
}; 