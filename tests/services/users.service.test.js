const mongoose = require('mongoose');
const { 
  getUserByIdService, 
  getUserByUserIdService,
  getUserByUsernameService,
  updateUserByIdService,
  deleteUserByIdService,
  getAllUsersService,
  getUsersByRoleService
} = require('../../src/services/users.service');
const User = require('../../src/models/user.model');

// Mock the logger
jest.mock('../../src/utils/logger');

describe('Users Service Tests', () => {
  const userData = {
    userID: 'SM-00001',
    username: 'testuser',
    fullName: 'Test User', // Using fullName instead of firstName/lastName
    email: 'test@example.com',
    // Password with at least one lowercase, uppercase, number, and special character
    password: 'Test@123!',
    role: 'ADMIN' // Valid role from enum
  };

  // Helper function to create test users directly with the model
  async function createTestUser(data) {
    const user = new User(data);
    return await user.save();
  }

  beforeEach(async () => {
    // Clear all users before each test
    await User.deleteMany({});
  });

  describe('getUserByIdService', () => {
    it('should retrieve a user by MongoDB ID', async () => {
      // First create a user using the model directly
      const user = await createTestUser({
        ...userData,
        username: 'iduser',
        email: 'id@example.com'
      });
      
      // Then retrieve by ID
      const retrievedUser = await getUserByIdService(user._id);
      
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser._id.toString()).toBe(user._id.toString());
      expect(retrievedUser.username).toBe('iduser');
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const result = await getUserByIdService(nonExistentId);
      
      expect(result).toBeNull();
    });
  });

  describe('getUserByUserIdService', () => {
    it('should retrieve a user by userID', async () => {
      // First create a user with a specific userID
       await createTestUser({
        ...userData,
        userID: 'SM-00002',
        username: 'useriduser',
        email: 'userid@example.com'
      });
      
      // Then retrieve by userID
      const retrievedUser = await getUserByUserIdService('SM-00002');
      
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser.userID).toBe('SM-00002');
      expect(retrievedUser.username).toBe('useriduser');
    });
  });

  describe('getUserByUsernameService', () => {
    it('should retrieve a user by username', async () => {
      const uniqueUsername = 'usernametest';
      
      // Create a user with a unique username
      await createTestUser({
        ...userData,
        username: uniqueUsername,
        email: 'username@example.com'
      });
      
      // Retrieve by username
      const retrievedUser = await getUserByUsernameService(uniqueUsername);
      
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser.username).toBe(uniqueUsername);
    });
  });

  describe('updateUserByIdService', () => {
    it('should update an existing user', async () => {
      // Create a user
      const user = await createTestUser({
        ...userData,
        username: 'updateuser',
        email: 'update@example.com'
      });
      
      // Update data - using fullName instead of firstName/lastName
      const updateData = {
        fullName: 'Updated Name',
        email: 'updated@example.com'
      };
      
      // Update user
      const result = await updateUserByIdService(user._id, updateData);
      
      expect(result).toBeDefined();
      expect(result.fullName).toBe(updateData.fullName);
      expect(result.email).toBe(updateData.email);
      // Username should remain unchanged
      expect(result.username).toBe('updateuser');
    });
  });

  describe('deleteUserByIdService', () => {
    it('should delete an existing user', async () => {
      // Create a user
      const user = await createTestUser({
        ...userData,
        username: 'deleteuser',
        email: 'delete@example.com'
      });
      
      // Delete the user
      const result = await deleteUserByIdService(user._id);
      
      expect(result).toBeDefined();
      
      // Verify user no longer exists
      const deletedUser = await getUserByIdService(user._id);
      expect(deletedUser).toBeNull();
    });
  });

  describe('getAllUsersService', () => {
    it('should retrieve all users', async () => {
      // Create multiple users
      await Promise.all([
        createTestUser({
          ...userData,
          userID: 'SM-00003',
          username: 'user1',
          email: 'user1@example.com'
        }),
        createTestUser({
          ...userData,
          userID: 'SM-00004',
          username: 'user2',
          email: 'user2@example.com'
        }),
        createTestUser({
          ...userData,
          userID: 'SM-00005',
          username: 'user3',
          email: 'user3@example.com'
        })
      ]);
      
      // Get all users
      const result = await getAllUsersService();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(3);
      
      // Check that our users are in the results
      const usernames = result.map(u => u.username);
      expect(usernames).toContain('user1');
      expect(usernames).toContain('user2');
      expect(usernames).toContain('user3');
    });
  });

  describe('getUsersByRoleService', () => {
    it('should filter users by role', async () => {
      // Create users with different roles
      await Promise.all([
        createTestUser({
          ...userData,
          userID: 'SM-00006',
          username: 'adminuser',
          email: 'admin@example.com',
          role: 'ADMIN'
        }),
        createTestUser({
          ...userData,
          userID: 'SM-00007',
          username: 'useruser',
          email: 'user@example.com',
          role: 'USER' // Changed from CUSTOMER to USER which is valid
        })
      ]);
      
      // Query with role filter
      const result = await getUsersByRoleService('ADMIN');
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      
      // All users in the result should have the ADMIN role
      expect(result.every(u => u.role === 'ADMIN')).toBe(true);
      // At least one of the users should have the username we created
      expect(result.some(u => u.username === 'adminuser')).toBe(true);
    });
  });
});