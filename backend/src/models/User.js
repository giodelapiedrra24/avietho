const User = {
  tableName: 'users',
  
  // Define user schema for validation
  schema: {
    id: { type: 'uuid', primaryKey: true },
    name: { type: 'string', required: true },
    email: { type: 'string', required: true, unique: true },
    password: { type: 'string', required: true },
    role: { type: 'string', enum: ['user', 'admin'], default: 'user' },
    status: { type: 'string', enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    created_at: { type: 'timestamp', default: 'now()' },
    updated_at: { type: 'timestamp', default: 'now()' }
  }
};

module.exports = User; 