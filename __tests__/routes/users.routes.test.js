const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const User = require('../../src/models/user.model');
const userRoutes = require('../../src/routes/users.routes');

// We'll use a variable to store the reference to our test users
let testUsers = {
  admin: null,
  user: null
};

// Mock authentication middleware - must be done before requiring the middleware
jest.mock('../../src/middlewares/auth.middleware', () => {
  return jest.fn((req, res, next) => {
    // We'll update this function in beforeEach to use a real user ID
    next();
  });
});

const isAuthenticated = require('../../src/middlewares/auth.middleware');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/users', userRoutes);

// Add error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message
  });
});

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

beforeEach(async () => {
  // Clear existing data
  await User.deleteMany({});

  // Setup test users
  const usersData = [
    {
      username: 'testadmin',
      email: 'admin@example.com',
      password: 'Password123!',
      fullName: 'Test Admin',
      role: 'ADMIN',
      userID: 'SM-00001'
    },
    {
      username: 'testuser',
      email: 'user@example.com',
      password: 'Password123!',
      fullName: 'Test User',
      role: 'USER',
      userID: 'SM-00002'
    }
  ];
  
  // Create users and store them for later use
  const createdUsers = await User.create(usersData);
  testUsers.admin = createdUsers[0];
  testUsers.user = createdUsers[1];

  // Update the mock implementation with a real user from the database
  isAuthenticated.mockImplementation((req, res, next) => {
    if (!req.user) {
      // Use the testadmin user we just created
      req.user = {
        _id: testUsers.admin._id,
        username: testUsers.admin.username,
        email: testUsers.admin.email,
        userID: testUsers.admin.userID,
        role: testUsers.admin.role,
        isAuthenticated: true
      };
    }
    next();
  });
});

afterEach(async () => {
  await User.deleteMany({});
  testUsers = { admin: null, user: null };
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('User Routes', () => {
  describe('GET /users/profile', () => {
    it('should return user profile for authenticated user', async () => {
      const res = await request(app)
        .get('/users/profile');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.username).toBe('testadmin');
    });
  });

  describe('GET /users', () => {
    it('should return all users with pagination', async () => {
      const res = await request(app)
        .get('/users');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.users).toHaveLength(2);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should respect query parameters', async () => {
      const res = await request(app)
        .get('/users?page=1&limit=1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.users).toHaveLength(1);
    });
  });

  describe('GET /users/role/:role', () => {
    it('should return users by role', async () => {
      const res = await request(app)
        .get('/users/role/ADMIN');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.users).toHaveLength(1);
      expect(res.body.data.users[0].username).toBe('testadmin');
    });

    it('should handle empty results', async () => {
      const res = await request(app)
        .get('/users/role/SUPERADMIN');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('No users found');
      expect(res.body.data.users).toHaveLength(0);
    });
  });

  describe('GET /users/userID/:userID', () => {
    it('should return user by userID', async () => {
      const res = await request(app)
        .get('/users/userID/SM-00002');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.username).toBe('testuser');
    });

    it('should return 404 for non-existent userID', async () => {
      const res = await request(app)
        .get('/users/userID/SM-99999');
      
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /users/username/:username', () => {
    it('should return user by username', async () => {
      const res = await request(app)
        .get('/users/username/testadmin');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.userID).toBe('SM-00001');
    });
  });

  describe('GET /users/email/:email', () => {
    it('should return user by email', async () => {
      const res = await request(app)
        .get('/users/email/user@example.com');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.username).toBe('testuser');
    });
  });

  // Test update functionality
  describe('PUT /users/profile', () => {
    it('should update authenticated user profile', async () => {
      const res = await request(app)
        .put('/users/profile')
        .send({ fullName: 'Updated Name' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.fullName).toBe('Updated Name');
      
      // Verify the update was saved to database
      const updatedUser = await User.findById(testUsers.admin._id);
      expect(updatedUser.fullName).toBe('Updated Name');
    });
  });
});
