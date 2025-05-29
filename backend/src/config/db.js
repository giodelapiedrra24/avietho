// This file will be used to initialize our database schema if needed
const supabase = require('./supabase');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Setup database - creates necessary tables and initial data if they don't exist
exports.setupDatabase = async () => {
  console.log('Checking database setup...');
  
  try {
    // Check Supabase connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (connectionError && connectionError.code !== 'PGRST116') {
      console.error('Error connecting to Supabase:', connectionError);
      throw connectionError;
    }

    // Create admin user if it doesn't exist
    console.log('Checking for admin user...');
    const { data: adminUser, error: adminCheckError } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'admin')
      .single();

    if (adminCheckError && adminCheckError.code !== 'PGRST116') {
      console.error('Error checking for admin user:', adminCheckError);
    } else if (!adminUser) {
      console.log('No admin user found, creating default admin account...');
      
      // Hash admin password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const { data: newAdmin, error: createAdminError } = await supabase
        .from('users')
        .insert([{
          name: 'Admin User',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'admin',
          status: 'approved'
        }])
        .select();
      
      if (createAdminError) {
        console.error('Error creating admin user:', createAdminError);
      } else {
        console.log('Admin user created successfully:', newAdmin[0].email);
      }
    } else {
      console.log('Admin user already exists:', adminUser.email);
    }

    // Check for default categories
    console.log('Checking for default categories...');
    const { data: categories, error: categoryCheckError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(1);
    
    if (categoryCheckError && categoryCheckError.code !== 'PGRST116') {
      console.error('Error checking for categories:', categoryCheckError);
    } else if (!categories || categories.length === 0) {
      console.log('No categories found, creating default categories...');
      
      const defaultCategories = [
        { name: 'Technology' },
        { name: 'Business' },
        { name: 'Health' },
        { name: 'Lifestyle' },
        { name: 'Travel' }
      ];
      
      const { data: newCategories, error: createCategoryError } = await supabase
        .from('categories')
        .insert(defaultCategories)
        .select();
      
      if (createCategoryError) {
        console.error('Error creating default categories:', createCategoryError);
      } else {
        console.log('Default categories created successfully:', newCategories.length);
      }
    } else {
      console.log('Categories already exist');
    }

    console.log('Database setup completed successfully');
    return true;
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
}; 