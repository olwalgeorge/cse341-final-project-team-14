const mongoose = require('mongoose');
const userController = require('../../src/controllers/users.controller');
const userService = require('../../src/services/users.service');
//eslint-disable-next-line no-unused-vars
const { DatabaseError } = require('../../src/utils/errors');

// Mock the user service
jest.mock('../../src/services/users.service');

// Mock the logger to prevent console output during tests
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('User Controller', () => {
  // Mock express request and response
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
      user: {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
        userID: 'SM-00001'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return user profile on success', async () => {
      const mockUser = {
        _id: req.user._id,
        username: 'testuser',
        email: 'test@example.com',
        userID: 'SM-00001',
        role: 'USER'
      };
      
      userService.getUserByIdService.mockResolvedValue(mockUser);
      
      await userController.getUserProfile(req, res, next);
      
      expect(userService.getUserByIdService).toHaveBeenCalledWith(req.user._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].data).toBeDefined();
    });

    it('should call next with error if user not found', async () => {
      userService.getUserByIdService.mockResolvedValue(null);
      
      await userController.getUserProfile(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    it('should handle missing user in session', async () => {
      req.user = null;
      
      await userController.getUserProfile(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });

  describe('updateUserProfile', () => {
    it('should update and return user profile', async () => {
      req.body = { fullName: 'Updated Name' };
      
      const mockUpdatedUser = {
        _id: req.user._id,
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Updated Name',
        userID: 'SM-00001'
      };
      
      userService.updateUserService.mockResolvedValue(mockUpdatedUser);
      
      await userController.updateUserProfile(req, res, next);
      
      expect(userService.updateUserService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle non-existent user', async () => {
      req.body = { fullName: 'Updated Name' };
      
      userService.updateUserService.mockResolvedValue(null);
      
      await userController.updateUserProfile(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      req.params.userID = 'SM-00001';
      
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
        userID: 'SM-00001'
      };
      
      userService.getUserByUserIdService.mockResolvedValue(mockUser);
      
      await userController.getUserById(req, res, next);
      
      expect(userService.getUserByUserIdService).toHaveBeenCalledWith('SM-00001');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle non-existent user', async () => {
      req.params.userID = 'SM-99999';
      
      userService.getUserByUserIdService.mockResolvedValue(null);
      
      await userController.getUserById(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with pagination', async () => {
      const mockUsers = {
        users: [
          { _id: new mongoose.Types.ObjectId(), username: 'user1' },
          { _id: new mongoose.Types.ObjectId(), username: 'user2' }
        ],
        pagination: {
          totalResults: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      userService.getAllUsersService.mockResolvedValue(mockUsers);
      
      await userController.getAllUsers(req, res, next);
      
      expect(userService.getAllUsersService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.users.length).toBe(2);
      expect(res.json.mock.calls[0][0].data.pagination).toBeDefined();
    });
  });

  describe('getUsersByRole', () => {
    it('should return users filtered by role', async () => {
      req.params.role = 'ADMIN';
      
      const mockResult = {
        users: [
          { _id: new mongoose.Types.ObjectId(), username: 'admin1', role: 'ADMIN' },
          { _id: new mongoose.Types.ObjectId(), username: 'admin2', role: 'ADMIN' }
        ],
        pagination: {
          totalResults: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      userService.getUsersByRoleService.mockResolvedValue(mockResult);
      
      await userController.getUsersByRole(req, res, next);
      
      expect(userService.getUsersByRoleService).toHaveBeenCalledWith('ADMIN', {});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.users.length).toBe(2);
    });

    it('should handle empty results', async () => {
      req.params.role = 'SUPERADMIN';
      
      userService.getUsersByRoleService.mockResolvedValue({
        users: [],
        pagination: { totalResults: 0, totalPages: 0, currentPage: 1, limit: 10 }
      });
      
      await userController.getUsersByRole(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].message).toContain('No users found');
    });
  });

  describe('searchUsers', () => {
    it('should search users by term', async () => {
      req.query.term = 'admin';
      
      const mockResult = {
        users: [
          { _id: new mongoose.Types.ObjectId(), username: 'admin1' },
          { _id: new mongoose.Types.ObjectId(), username: 'admin2' }
        ],
        pagination: {
          totalResults: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 10
        }
      };
      
      userService.searchUsersService.mockResolvedValue(mockResult);
      
      await userController.searchUsers(req, res, next);
      
      // The controller is passing the entire req.query object rather than just the term
      expect(userService.searchUsersService).toHaveBeenCalledWith('admin', { term: 'admin' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.users.length).toBe(2);
    });
  });

  // Add brief tests for the remaining controller functions
  describe('deleteUserById', () => {
    it('should delete user by ID', async () => {
      req.params.user_Id = new mongoose.Types.ObjectId();
      
      userService.deleteUserByIdService.mockResolvedValue({ username: 'deleted' });
      
      await userController.deleteUserById(req, res, next);
      
      expect(userService.deleteUserByIdService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteAllUsers', () => {
    it('should delete all users', async () => {
      userService.deleteAllUsersService.mockResolvedValue({ deletedCount: 5 });
      
      await userController.deleteAllUsers(req, res, next);
      
      expect(userService.deleteAllUsersService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.deletedCount).toBe(5);
    });
  });
});
