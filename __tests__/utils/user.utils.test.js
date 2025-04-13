const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../src/models/user.model');
const { transformUser, transformUserData, generateuserID } = require('../../src/utils/user.utils');

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

describe('User Utils', () => {
  describe('transformUser', () => {
    it('should transform a user object correctly', () => {
      const user = {
        _id: new mongoose.Types.ObjectId(),
        userID: 'SM-00001',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        profilePicture: 'https://example.com/pic.jpg',
        bio: 'Test bio',
        website: 'https://test.com',
        location: 'Test Location',
        isVerified: true,
        role: 'USER',
        phoneNumber: '1234567890',
        preferences: { theme: 'dark' },
        password: 'shouldNotBeExposed',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const transformedUser = transformUser(user);

      // Check that sensitive fields are removed
      expect(transformedUser.password).toBeUndefined();
      expect(transformedUser.createdAt).toBeUndefined();
      expect(transformedUser.updatedAt).toBeUndefined();
      
      // Check that mapped fields are correct
      expect(transformedUser.user_id.toString()).toBe(user._id.toString());
      expect(transformedUser.userID).toBe(user.userID);
      expect(transformedUser.username).toBe(user.username);
      expect(transformedUser.email).toBe(user.email);
      expect(transformedUser.fullName).toBe(user.fullName);
    });

    it('should return null for null input', () => {
      expect(transformUser(null)).toBeNull();
    });
  });

  describe('transformUserData', () => {
    it('should filter allowed fields for update', () => {
      const inputData = {
        username: 'newusername',
        email: 'new@example.com',
        fullName: 'New Name',
        profilePicture: 'new.jpg',
        bio: 'New bio',
        website: 'https://new.com',
        location: 'New Location',
        phoneNumber: '9876543210',
        preferences: { notifications: true },
        role: 'ADMIN',
        _id: 'should-be-filtered',
        createdAt: 'should-be-filtered',
        userID: 'should-be-filtered'
      };

      const transformed = transformUserData(inputData);

      // Should include allowed fields
      expect(transformed.username).toBe(inputData.username);
      expect(transformed.email).toBe(inputData.email);
      expect(transformed.fullName).toBe(inputData.fullName);
      expect(transformed.role).toBe(inputData.role);
      
      // Should exclude protected fields
      expect(transformed._id).toBeUndefined();
      expect(transformed.createdAt).toBeUndefined();
      expect(transformed.userID).toBeUndefined();
    });
  });

  describe('generateuserID', () => {
    it('should generate the first user ID as SM-00001', async () => {
      const id = await generateuserID();
      expect(id).toBe('SM-00001');
    });

    it('should increment user ID sequentially', async () => {
      // Create a user with ID SM-00005
      await new User({
        username: 'user5',
        email: 'user5@example.com',
        password: 'Password123!',
        userID: 'SM-00005'
      }).save();

      // Next ID should be SM-00006
      const nextId = await generateuserID();
      expect(nextId).toBe('SM-00006');
    });
  });
});
