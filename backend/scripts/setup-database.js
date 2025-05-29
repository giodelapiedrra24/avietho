const { setupDatabase } = require('../src/config/db');
require('dotenv').config();

// Run the database setup
(async () => {
  try {
    console.log('Starting database setup...');
    await setupDatabase();
    console.log('Database setup completed successfully!');
    console.log('--------------------------------------------------');
    console.log('Admin user created:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('--------------------------------------------------');
    console.log('Please change the admin password after first login!');
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
})(); 