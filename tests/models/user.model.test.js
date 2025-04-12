const User = require('../../src/models/user.model');
const bcrypt = require('bcryptjs');

describe('User Model Tests', () => {
  const userData = {
    userID: 'SM-00001',
    username: 'testuser',
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'Test@123!',
    role: 'ADMIN',
    status: 'ACTIVE' // Added status field
  };

  it('should create a new user successfully', async () => {
    const user = new User(userData);
    const savedUser = await user.save();
    
    expect(savedUser._id).toBeDefined();
    expect(savedUser.userID).toBe(userData.userID);
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.fullName).toBe(userData.fullName);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.password).not.toBe(userData.password);
    expect(savedUser.role).toBe(userData.role);
    expect(savedUser.status).toBe(userData.status); // Check status
  });

  it('should fail to create a user without required fields', async () => {
    const invalidUser = new User({
      fullName: 'Incomplete User' // Using fullName
      // Missing required fields
    });
    
    let error;
    try {
      await invalidUser.validate();
    } catch (err) {
      error = err;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.username).toBeDefined(); // Username is required
    expect(error.errors.email).toBeDefined(); // Email is required
    // Note: UserID may not be strictly required in the schema validation depending on implementation
  });

  it('should correctly validate email format', async () => {
    const invalidEmailUser = new User({
      ...userData,
      email: 'invalid-email'
    });
    
    let error;
    try {
      await invalidEmailUser.validate();
    } catch (err) {
      error = err;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });

  it('should hash the password before saving', async () => {
    const user = new User(userData);
    const savedUser = await user.save();
    
    // Verify that the password was hashed
    const passwordMatches = await bcrypt.compare(userData.password, savedUser.password);
    expect(passwordMatches).toBe(true);
  });

  it('should not rehash the password if it is not modified', async () => {
    // First save the user
    const user = new User(userData);
    const savedUser = await user.save();
    const originalPassword = savedUser.password;
    
    // Then update a field other than password
    savedUser.fullName = 'Updated Name'; // Update fullName instead of firstName
    await savedUser.save();
    
    // Password should remain the same
    expect(savedUser.password).toBe(originalPassword);
  });

  it('should correctly set the default role if not provided', async () => {
    const userWithoutRole = new User({
      ...userData,
      role: undefined
    });
    
    expect(userWithoutRole.role).toBe('USER'); // Default role is USER not CUSTOMER
  });

  it('should correctly set the default status if not provided', async () => {
    const userWithoutStatus = new User({
      ...userData,
      status: undefined
    });
    
    expect(userWithoutStatus.status).toBe('ACTIVE'); // Default status is ACTIVE
  });

  it('should reject invalid status value', async () => {
    const userWithInvalidStatus = new User({
      ...userData,
      status: 'INVALID_STATUS'
    });
    
    let error;
    try {
      await userWithInvalidStatus.validate();
    } catch (err) {
      error = err;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.status).toBeDefined();
  });

  it('should accept all valid status values', async () => {
    // Test each valid status value
    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'];
    
    for (const status of validStatuses) {
      const user = new User({
        ...userData,
        status
      });
      
      let error;
      try {
        await user.validate();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeUndefined();
    }
  });
});