const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { 
  generateToken, 
  generateRefreshToken,
  hashPassword, 
  comparePassword, 
  formatResponse,
  validatePasswordStrength,
  sanitizeOutput
} = require('../utils/helpers');
require('dotenv').config();

// Register a new user
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  
  console.log('Registration attempt for:', email);

  // Basic validation
  if (!name || !email || !password) {
    console.log('Registration validation failed - missing fields');
    return res.status(400).json(
      formatResponse(false, null, 'Please provide name, email and password', 400)
    );
  }

  try {
    // Check if user already exists
    console.log('Checking if user exists...');
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError);
      return res.status(500).json(
        formatResponse(false, null, 'Error checking user existence', 500)
      );
    }

    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(400).json(
        formatResponse(false, null, 'User with that email already exists', 400)
      );
    }

    // Hash password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Special case for giodelapiedra24@gmail.com - auto approve and make admin
    const isSpecialEmail = email === 'giodelapiedra24@gmail.com';
    
    // Try creating user with status field first
    console.log('Creating new user...');
    let userData = { 
      name, 
      email, 
      password: hashedPassword,
      role: isSpecialEmail ? 'admin' : 'user'
    };

    // Try to add status if it exists in the schema
    try {
      userData.status = isSpecialEmail ? 'approved' : 'pending';
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([userData])
        .select();

      if (error) {
        if (error.message && error.message.includes('status') && error.message.includes('column')) {
          // If status column doesn't exist, try without it
          throw error;
        }
        
        console.error('Error creating user in Supabase:', error);
        return res.status(500).json(
          formatResponse(false, null, `Error creating user: ${error.message}`, 500)
        );
      }

      // Remove password from response
      console.log('User created successfully with status field:', newUser[0].id);
      const user = newUser[0];
      delete user.password;

      // Only generate token for auto-approved users (special case)
      let token = null;
      if (isSpecialEmail) {
        token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET || 'fallback-secret-key-for-development',
          { expiresIn: process.env.JWT_EXPIRE || '1d' }
        );
      }
      
      const message = isSpecialEmail 
        ? 'User registered successfully.' 
        : 'User registered successfully. Your account is pending approval.';

      res.status(201).json(
        formatResponse(true, { user, token }, message, 201)
      );
    } catch (statusError) {
      // If status column doesn't exist, try without it
      console.log('Trying to create user without status field...');
      delete userData.status;
      
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([userData])
        .select();

      if (error) {
        console.error('Error creating user without status:', error);
        return res.status(500).json(
          formatResponse(false, null, `Error creating user: ${error.message}`, 500)
        );
      }

      // Remove password from response
      console.log('User created successfully without status field:', newUser[0].id);
      const user = newUser[0];
      delete user.password;

      // Only generate token for the special email
      let token = null;
      if (isSpecialEmail) {
        token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET || 'fallback-secret-key-for-development',
          { expiresIn: process.env.JWT_EXPIRE || '1d' }
        );
      }

      const message = isSpecialEmail 
        ? 'User registered successfully.' 
        : 'User registered successfully. Please wait for admin approval.';

      res.status(201).json(
        formatResponse(true, { user, token }, message, 201)
      );
    }
  } catch (err) {
    console.error('Register error - detailed:', err);
    if (err.message) console.error('Error message:', err.message);
    if (err.stack) console.error('Error stack:', err.stack);
    
    res.status(500).json(
      formatResponse(false, null, `Server error: ${err.message}`, 500)
    );
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json(
      formatResponse(false, null, 'Please provide email and password', 400)
    );
  }

  try {
    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json(
        formatResponse(false, null, 'Invalid credentials', 401)
      );
    }

    // Special case: if the email is giodelapiedra24@gmail.com, make them an admin
    if (email === 'giodelapiedra24@gmail.com') {
      console.log('Special case: Making giodelapiedra24@gmail.com an admin');
      
      let updateData = { role: 'admin' };
      
      // Only include status if the field exists
      if (user.hasOwnProperty('status')) {
        updateData.status = 'approved';
      }
      
      // Update user to be admin in the database
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('email', email)
        .select('*')
        .single();
      
      if (!updateError) {
        // Use the updated user data
        user.role = 'admin';
        if (user.hasOwnProperty('status')) {
          user.status = 'approved';
        }
        console.log('Successfully updated user to admin');
      } else {
        console.error('Error updating user to admin:', updateError);
      }
    }

    // Check if account is approved (bypass for admin)
    // Only check status if the field exists and user is not admin
    if (user.hasOwnProperty('status') && user.role !== 'admin' && user.status !== 'approved') {
      return res.status(401).json(
        formatResponse(false, null, user.status === 'pending' ? 
          'Your account is pending approval' : 
          'Your account has been rejected or suspended', 401)
      );
    }

    // If status column doesn't exist but user is not admin, prevent login for safety
    if (!user.hasOwnProperty('status') && user.role !== 'admin') {
      return res.status(401).json(
        formatResponse(false, null, 'Your account requires approval. Please contact an administrator.', 401)
      );
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(
        formatResponse(false, null, 'Invalid credentials', 401)
      );
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-key-for-development',
      { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );

    // Remove password from response
    delete user.password;

    // Set cookie
    const cookieOptions = {
      expires: new Date(Date.now() + (24 * 60 * 60 * 1000)), // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    };
    
    res.cookie('token', token, cookieOptions);

    res.json(
      formatResponse(true, { user, token }, 'Login successful')
    );
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json(
      formatResponse(false, null, 'Server error', 500)
    );
  }
};

// Get current user
exports.getProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json(
        formatResponse(false, null, 'User not found', 404)
      );
    }

    res.json(
      formatResponse(true, { user }, 'User profile fetched successfully')
    );
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json(
      formatResponse(false, null, 'Server error', 500)
    );
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const updates = {};

  if (name) updates.name = name;
  if (email) updates.email = email;

  // Check if there's anything to update
  if (Object.keys(updates).length === 0) {
    return res.status(400).json(
      formatResponse(false, null, 'Please provide at least one field to update', 400)
    );
  }

  try {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, name, email, role, status, created_at');

    if (error) {
      return res.status(500).json(
        formatResponse(false, null, 'Error updating profile', 500)
      );
    }

    res.json(
      formatResponse(true, { user: updatedUser[0] }, 'Profile updated successfully')
    );
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json(
      formatResponse(false, null, 'Server error', 500)
    );
  }
};

// Logout
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true
  });

  res.json(
    formatResponse(true, null, 'Logged out successfully')
  );
};

// Admin: Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    console.log('Getting all users, requesting user ID:', req.user.id);
    console.log('Requesting user role:', req.user.role);
    
    if (req.user.role !== 'admin') {
      console.log('Non-admin user attempted to access getAllUsers');
      return res.status(403).json(
        formatResponse(false, null, 'Access denied. Admin only.', 403)
      );
    }
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users from database:', error);
      return res.status(500).json(
        formatResponse(false, null, 'Error fetching users', 500)
      );
    }
    
    console.log(`Found ${users.length} users`);
    
    res.json(
      formatResponse(true, { users }, 'Users fetched successfully')
    );
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json(
      formatResponse(false, null, 'Server error', 500)
    );
  }
};

// Admin: Approve or reject user
exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json(
      formatResponse(false, null, 'Invalid status value', 400)
    );
  }

  try {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', id)
      .select('id, name, email, role, status, created_at');

    if (error) {
      return res.status(500).json(
        formatResponse(false, null, 'Error updating user status', 500)
      );
    }

    res.json(
      formatResponse(true, { user: updatedUser[0] }, `User ${status === 'approved' ? 'approved' : 'rejected'} successfully`)
    );
  } catch (err) {
    console.error('Update user status error:', err);
    res.status(500).json(
      formatResponse(false, null, 'Server error', 500)
    );
  }
};

// Admin: Update user role
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json(
      formatResponse(false, null, 'Invalid role value', 400)
    );
  }

  try {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select('id, name, email, role, status, created_at');

    if (error) {
      return res.status(500).json(
        formatResponse(false, null, 'Error updating user role', 500)
      );
    }

    res.json(
      formatResponse(true, { user: updatedUser[0] }, 'User role updated successfully')
    );
  } catch (err) {
    console.error('Update user role error:', err);
    res.status(500).json(
      formatResponse(false, null, 'Server error', 500)
    );
  }
}; 