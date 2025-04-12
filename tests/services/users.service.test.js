const mongoose = require('mongoose');
const { 
  getAllUsersService,
  getUserByIdService,
  getUserByUserIDService,
  getUserByUsernameService,
  getUserByEmailService,
  getUsersByRoleService,
  createUserService,
  updateUserService,
  deleteUserService,
  searchUsersService
} = require('../../src/services/users.service');
const User = require('../../src/models/user.model');
const bcrypt = require('bcryptjs');
const { generateUserID } = require('../../src/utils/user.utils');

// Mock the user utils module
jest.mock('../../src/utils/user.utils');
jest.mock('../../src/utils/logger');

describe('Users Service Tests', () => {
  const userData = {
    userID: 'SM-00001',
    username: 'testuser',
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'Test@123!',
    role: 'ADMIN',
    status: 'ACTIVE'
  };

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Clear the users collection before each test
    await User.deleteMany({});
    // Set up the generateUserID mock to return a unique ID for each call
    let counter = 1;
    generateUserID.mockImplementation(() => {
      return Promise.resolve(`SM-${String(counter++).padStart(5, '0')}`);
    });
  });

  describe('createUserService', () => {
    it('should create a new user', async () => {
      // Add userID to match the implementation
      const userWithId = { 
        ...userData,
        userID: 'SM-00001'
      };
      
      const result = await createUserService(userWithId);
      
      expect(result._id).toBeDefined();
      expect(result.userID).toBe('SM-00001');
      expect(result.username).toBe(userData.username);
      expect(result.fullName).toBe(userData.fullName);
      expect(result.email).toBe(userData.email);
      expect(result.role).toBe(userData.role);
      expect(result.status).toBe(userData.status);
      
      // Verify password is hashed
      const passwordMatches = await bcrypt.compare(userData.password, result.password);
      expect(passwordMatches).toBe(true);
    });

    it('should throw an error for duplicate email', async () => {
      // First create a user
      await createUserService({
        ...userData,
        userID: 'SM-00001'
      });
      
      // Try to create another user with the same email
      const duplicateUser = {
        ...userData,
        userID: 'SM-00002',
        username: 'anotheruser'
      };
      
      await expect(createUserService(duplicateUser)).rejects.toThrow();
    });

    it('should throw an error for duplicate username', async () => {
      // First create a user
      await createUserService({
        ...userData,
        userID: 'SM-00001'
      });
      
      // Try to create another user with the same username
      const duplicateUser = {
        ...userData,
        userID: 'SM-00002',
        email: 'another@example.com'
      };
      
      await expect(createUserService(duplicateUser)).rejects.toThrow();
    });
  });

  describe('getUserByIdService', () => {
    it('should retrieve a user by ID', async () => {
      // First create a user with a unique ID
      const user = await createUserService({
        ...userData,
        userID: 'SM-00002'
      });
      
      // Then retrieve it by ID
      const result = await getUserByIdService(user._id);
      
      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(user._id.toString());
      expect(result.username).toBe(userData.username);
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const result = await getUserByIdService(nonExistentId);
      
      expect(result).toBeNull();
    });
  });

  describe('getUserByUserIDService', () => {
    it('should retrieve a user by userID', async () => {
      // First create a user
      await createUserService({
        ...userData,
        userID: 'SM-00001'
      });
      
      // Then retrieve it by userID
      const result = await getUserByUserIDService('SM-00001');
      
      expect(result).toBeDefined();
      expect(result.userID).toBe('SM-00001');
      expect(result.username).toBe(userData.username);
    });

    it('should return null for non-existent userID', async () => {
      const result = await getUserByUserIDService('SM-99999');
      
      expect(result).toBeNull();
    });
  });

  describe('getUserByUsernameService', () => {
    it('should retrieve a user by username', async () => {
      // First create a user
      await createUserService({
        ...userData,
        userID: 'SM-00001'
      });
      
      // Then retrieve it by username
      const result = await getUserByUsernameService('testuser');
      
      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
    });
  });

  describe('getUserByEmailService', () => {
    it('should retrieve a user by email', async () => {
      // First create a user
      await createUserService({
        ...userData,
        userID: 'SM-00001'
      });
      
      // Then retrieve it by email
      const result = await getUserByEmailService('test@example.com');
      
      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('updateUserService', () => {
    it('should update an existing user', async () => {
      // First create a user
      const user = await createUserService({
        ...userData,
        userID: 'SM-00003'
      });
      
      // Update data
      const updateData = {
        fullName: 'Updated User Name',
        status: 'INACTIVE'
      };
      
      // Update user
      const result = await updateUserService(user._id, updateData);
      
      expect(result).toBeDefined();
      expect(result.fullName).toBe(updateData.fullName);
      expect(result.status).toBe(updateData.status);
      // Original fields should remain unchanged
      expect(result.userID).toBe('SM-00003');
      expect(result.username).toBe(userData.username);
    });

    it('should hash password when updating password', async () => {
      // First create a user
      const user = await createUserService({
        ...userData,
        userID: 'SM-00004'
      });
      
      const newPassword = 'NewPassword123!';
      
      // Update password
      const result = await updateUserService(user._id, { password: newPassword });
      
      expect(result).toBeDefined();
      // Verify password is hashed
      const passwordMatches = await bcrypt.compare(newPassword, result.password);
      expect(passwordMatches).toBe(true);
    });
  });

  describe('deleteUserService', () => {
    it('should delete an existing user', async () => {
      // First create a user
      const user = await createUserService({
        ...userData,
        userID: 'SM-00005'
      });
      
      // Delete the user
      const result = await deleteUserService(user._id);
      
      expect(result).toBeDefined();
      expect(result.acknowledged).toBe(true);
      expect(result.deletedCount).toBe(1);
      
      // Verify user no longer exists
      const deletedUser = await getUserByIdService(user._id);
      expect(deletedUser).toBeNull();
    });
  });

  describe('getAllUsersService', () => {
    it('should retrieve all users with pagination', async () => {
      // Create multiple users
      await Promise.all([
        createUserService({
          ...userData,
          userID: 'SM-00006',
          username: 'user1',
          email: 'user1@example.com'
        }),
        createUserService({
          ...userData,
          userID: 'SM-00007',
          username: 'user2',
          email: 'user2@example.com'
        }),
        createUserService({
          ...userData,
          userID: 'SM-00008',
          username: 'user3',
          email: 'user3@example.com'
        })
      ]);
      
      // Get all users with pagination
      const result = await getAllUsersService({ page: 1, limit: 2 });
      
      expect(result).toBeDefined();
      expect(result.users).toBeInstanceOf(Array);
      expect(result.users.length).toBe(2); // Limited to 2 per page
      expect(result.pagination.total).toBeGreaterThanOrEqual(3);
      expect(result.pagination.totalPages).toBeGreaterThanOrEqual(2);
    });

    it('should filter users by status when specified', async () => {
      // Create users with different statuses
      await Promise.all([
        createUserService({
          ...userData,
          userID: 'SM-00009',
          username: 'active1',
          email: 'active1@example.com',
          status: 'ACTIVE'
        }),
        createUserService({
          ...userData,
          userID: 'SM-00010',
          username: 'active2',
          email: 'active2@example.com',
          status: 'ACTIVE'
        }),
        createUserService({
          ...userData,
          userID: 'SM-00011',
          username: 'inactive1',
          email: 'inactive1@example.com',
          status: 'INACTIVE'
        })
      ]);
      
      // Filter by ACTIVE status
      const result = await getAllUsersService({ status: 'ACTIVE' });
      
      expect(result.users.length).toBe(2);
      expect(result.users.every(user => user.status === 'ACTIVE')).toBe(true);
    });
  });

  describe('getUsersByRoleService', () => {
    it('should retrieve users by role with pagination', async () => {
      // Create users with different roles
      await Promise.all([
        createUserService({
          ...userData,
          userID: 'SM-00012',
          username: 'admin1',
          email: 'admin1@example.com',
          role: 'ADMIN'
        }),
        createUserService({
          ...userData,
          userID: 'SM-00013',
          username: 'admin2',
          email: 'admin2@example.com',
          role: 'ADMIN'
        }),
        createUserService({
          ...userData,
          userID: 'SM-00014',
          username: 'user1',
          email: 'user1@example.com',
          role: 'USER'
        })
      ]);
      
      // Get users with ADMIN role
      const result = await getUsersByRoleService('ADMIN', { page: 1, limit: 10 });
      
      expect(result.users.length).toBe(2);
      expect(result.users.every(user => user.role === 'ADMIN')).toBe(true);
    });
  });

  describe('searchUsersService', () => {
    it('should search users by text term', async () => {
      // Create users with different data
      await Promise.all([
        createUserService({
          ...userData,
          userID: 'SM-00015',
          username: 'johndoe',
          fullName: 'John Doe',
          email: 'john@example.com'
        }),
        createUserService({
          ...userData,
          userID: 'SM-00016',
          username: 'janedoe',
          fullName: 'Jane Doe',
          email: 'jane@example.com'
        }),
        createUserService({
          ...userData,
          userID: 'SM-00017',
          username: 'bobsmith',
          fullName: 'Bob Smith',
          email: 'bob@example.com'
        })
      ]);
      
      // Search for users with 'doe' in name or username
      const result = await searchUsersService('doe', { page: 1, limit: 10 });
      
      expect(result.users.length).toBe(2);
      expect(result.users.some(user => user.fullName === 'John Doe')).toBe(true);
      expect(result.users.some(user => user.fullName === 'Jane Doe')).toBe(true);
    });
  });
});