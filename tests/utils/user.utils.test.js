const mongoose = require('mongoose');
const { transformUser, generateUserID } = require('../../src/utils/user.utils');
const User = require('../../src/models/user.model');

// Unmock the user.utils module that's mocked globally in setup.js
jest.unmock('../../src/utils/user.utils');

describe('User Utilities Tests', () => {
  // Clear the users collection before running these tests
  beforeAll(async () => {
    await User.deleteMany({});
  });

  describe('transformUser', () => {
    it('should transform user object correctly', () => {
      const user = {
        _id: new mongoose.Types.ObjectId(),
        userID: 'SM-00001',
        username: 'testuser',
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const transformedUser = transformUser(user);

      // Verify transformed structure
      expect(transformedUser.user_Id).toBeDefined();
      expect(transformedUser.userID).toBe(user.userID);
      expect(transformedUser.username).toBe(user.username);
      expect(transformedUser.fullName).toBe(user.fullName);
      expect(transformedUser.email).toBe(user.email);
      expect(transformedUser.role).toBe(user.role);
      expect(transformedUser.status).toBe(user.status);
      
      // Password should not be included
      expect(transformedUser.password).toBeUndefined();
      
      // Additional properties
      expect(transformedUser.createdAt).toBeDefined();
      expect(transformedUser.updatedAt).toBeDefined();
    });

    it('should return null for null input', () => {
      const result = transformUser(null);
      expect(result).toBeNull();
    });
  });

  describe('generateUserID', () => {
    it('should generate a user ID in the correct format', async () => {
      // Create some test users first to test the counter logic
      await User.create({
        userID: 'SM-00001',
        username: 'user1',
        fullName: 'User One',
        email: 'user1@example.com',
        password: 'hashedpassword',
        role: 'USER',
        status: 'ACTIVE'
      });
      
      await User.create({
        userID: 'SM-00002',
        username: 'user2',
        fullName: 'User Two',
        email: 'user2@example.com',
        password: 'hashedpassword',
        role: 'USER',
        status: 'ACTIVE'
      });
      
      // Generate the next ID
      const nextID = await generateUserID();
      
      // Check format: should be SM-<5-digit number>
      expect(nextID).toMatch(/^SM-\d{5}$/);
      
      // Should increment from the highest existing ID
      expect(nextID).toBe('SM-00003');
    });

    it('should start from SM-00001 if no users exist', async () => {
      // Clear all users
      await User.deleteMany({});
      
      // Generate the first ID
      const firstID = await generateUserID();
      
      // Should be SM-00001
      expect(firstID).toBe('SM-00001');
    });
  });
});
