const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../src/models/user.model');
// eslint-disable-next-line no-unused-vars
const bcrypt = require('bcryptjs');

let mongoServer;

// Connect to a new in-memory database before running tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Clear database after each test
afterEach(async () => {
  await User.deleteMany({});
});

// Disconnect and close database after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('User Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
        userID: 'SM-00001',
        role: 'USER'
      };
      
      const validUser = new User(userData);
      const savedUser = await validUser.save();
      
      // Verify saved user
      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.fullName).toBe(userData.fullName);
      expect(savedUser.userID).toBe(userData.userID);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.isVerified).toBe(false); // Default value
    });
    
    it('should fail on duplicate username', async () => {
      // Create first user
      await new User({
        username: 'duplicate',
        email: 'first@example.com',
        password: 'Password123!',
        userID: 'SM-00001'
      }).save();
      
      // Try to create a second user with same username
      const duplicateUser = new User({
        username: 'duplicate',
        email: 'second@example.com',
        password: 'Password123!',
        userID: 'SM-00002'
      });
      
      await expect(duplicateUser.save()).rejects.toThrow();
    });
    
    it('should fail on duplicate email', async () => {
      // Create first user
      await new User({
        username: 'first',
        email: 'duplicate@example.com',
        password: 'Password123!',
        userID: 'SM-00001'
      }).save();
      
      // Try to create a second user with same email
      const duplicateUser = new User({
        username: 'second',
        email: 'duplicate@example.com',
        password: 'Password123!',
        userID: 'SM-00002'
      });
      
      await expect(duplicateUser.save()).rejects.toThrow();
    });
    
    it('should fail with invalid username format', async () => {
      const invalidUser = new User({
        username: '123invalid', // Username can't start with numbers
        email: 'test@example.com',
        password: 'Password123!',
        userID: 'SM-00001'
      });
      
      await expect(invalidUser.save()).rejects.toThrow();
    });
    
    it('should fail with invalid email format', async () => {
      const invalidUser = new User({
        username: 'validusername',
        email: 'invalid-email', // Not a valid email format
        password: 'Password123!',
        userID: 'SM-00001'
      });
      
      await expect(invalidUser.save()).rejects.toThrow();
    });
    
    it('should fail with invalid password format', async () => {
      const invalidUser = new User({
        username: 'validusername',
        email: 'test@example.com',
        password: 'weak', // Not meeting password requirements
        userID: 'SM-00001'
      });
      
      await expect(invalidUser.save()).rejects.toThrow();
    });
    
    it('should fail with invalid userID format', async () => {
      const invalidUser = new User({
        username: 'validusername',
        email: 'test@example.com',
        password: 'Password123!',
        userID: 'INVALID' // Not matching SM-XXXXX pattern
      });
      
      await expect(invalidUser.save()).rejects.toThrow();
    });
  });
  
  describe('Password Handling', () => {
    it('should hash password before saving', async () => {
      const password = 'Password123!';
      const user = new User({
        username: 'passwordtest',
        email: 'password@example.com',
        password: password,
        userID: 'SM-00001'
      });
      
      const savedUser = await user.save();
      
      // Get the user with password field (which is normally excluded)
      const userWithPassword = await User.findById(savedUser._id).select('+password');
      
      // Password should not be stored in plain text
      expect(userWithPassword.password).not.toBe(password);
      
      // Should be a valid bcrypt hash
      expect(userWithPassword.password).toMatch(/^\$2[aby]\$\d+\$/);
    });
    
    it('should correctly verify a valid password', async () => {
      const password = 'Password123!';
      const user = new User({
        username: 'verifytest',
        email: 'verify@example.com',
        password: password,
        userID: 'SM-00001'
      });
      
      await user.save();
      
      // Test the password verification method
      const isMatch = await user.isPasswordMatch(password);
      expect(isMatch).toBe(true);
    });
    
    it('should reject an invalid password', async () => {
      const user = new User({
        username: 'rejecttest',
        email: 'reject@example.com',
        password: 'Password123!',
        userID: 'SM-00001'
      });
      
      await user.save();
      
      // Test with wrong password
      const isMatch = await user.isPasswordMatch('WrongPassword123!');
      expect(isMatch).toBe(false);
    });
    
    it('should not rehash password on update unless changed', async () => {
      // Create a user
      const user = new User({
        username: 'updatetest',
        email: 'update@example.com',
        password: 'Password123!',
        userID: 'SM-00001'
      });
      
      const savedUser = await user.save();
      const originalPasswordHash = (await User.findById(savedUser._id).select('+password')).password;
      
      // Update user without changing password
      savedUser.fullName = 'Updated Name';
      await savedUser.save();
      
      // Get updated user with password
      const updatedUser = await User.findById(savedUser._id).select('+password');
      
      // Password hash should remain the same
      expect(updatedUser.password).toBe(originalPasswordHash);
    });
  });
  
  describe('Role Management', () => {
    it('should set USER as default role', async () => {
      const user = new User({
        username: 'defaultrole',
        email: 'default@example.com',
        password: 'Password123!',
        userID: 'SM-00001'
      });
      
      const savedUser = await user.save();
      expect(savedUser.role).toBe('USER');
    });
    
    it('should accept valid roles', async () => {
      const validRoles = ['SUPERADMIN', 'ADMIN', 'USER', 'ORG'];
      
      for (const role of validRoles) {
        const user = new User({
          username: `${role.toLowerCase()}user`,
          email: `${role.toLowerCase()}@example.com`,
          password: 'Password123!',
          role: role,
          userID: `SM-0000${validRoles.indexOf(role) + 1}`
        });
        
        const savedUser = await user.save();
        expect(savedUser.role).toBe(role);
      }
    });
    
    it('should reject invalid roles', async () => {
      const user = new User({
        username: 'invalidrole',
        email: 'invalid@example.com',
        password: 'Password123!',
        role: 'INVALID_ROLE',
        userID: 'SM-00001'
      });
      
      await expect(user.save()).rejects.toThrow();
    });
  });
});
