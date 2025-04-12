const mongoose = require('mongoose');
const {
  getAllUsers,
  getUserById,
  getUserByUserID,
  getUserByUsername,
  getUserByEmail,
  getUsersByRole,
  updateUserById,
  deleteUserById,
  getUserProfile,
  updateUserProfile
} = require('../../src/controllers/users.controller');
const userService = require('../../src/services/users.service');
const userUtils = require('../../src/utils/user.utils');
const { DatabaseError } = require('../../src/utils/errors');

// Mock the necessary modules and functions
jest.mock('../../src/services/users.service');
jest.mock('../../src/utils/logger');
jest.mock('express-async-handler', () => (fn) => fn);
jest.mock('../../src/utils/response', () => jest.fn());

// Create a manual mock for user.utils
jest.mock('../../src/utils/user.utils', () => ({
  generateUserID: jest.fn().mockResolvedValue('SM-00001'),
  transformUser: jest.fn(user => {
    if (!user) return null;
    return {
      user_Id: user._id,
      userID: user.userID,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status
    };
  })
}));

describe('Users Controller Tests', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;
  const sendResponse = require('../../src/utils/response');

  beforeEach(() => {
    mockRequest = {
      params: {},
      query: {},
      body: {},
      user: {
        _id: new mongoose.Types.ObjectId(),
        userID: 'SM-00001',
        username: 'testuser',
        role: 'ADMIN'
      }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should get all users with pagination', async () => {
      // Mock data
      const mockUsers = [
        {
          _id: new mongoose.Types.ObjectId(),
          userID: 'SM-00001',
          username: 'user1',
          fullName: 'Test User 1',
          email: 'user1@example.com',
          role: 'ADMIN',
          status: 'ACTIVE'
        },
        {
          _id: new mongoose.Types.ObjectId(),
          userID: 'SM-00002',
          username: 'user2',
          fullName: 'Test User 2',
          email: 'user2@example.com',
          role: 'USER',
          status: 'ACTIVE'
        }
      ];
      
      const mockPagination = {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      };
      
      // Configure mock
      userService.getAllUsersService.mockResolvedValue({
        users: mockUsers,
        pagination: mockPagination
      });
      
      // Execute controller function
      await getAllUsers(mockRequest, mockResponse, mockNext);
      
      // Verify results
      expect(sendResponse).toHaveBeenCalledWith(
        mockResponse,
        200,
        'Users retrieved successfully',
        {
          users: expect.any(Array),
          pagination: mockPagination
        }
      );
      expect(userService.getAllUsersService).toHaveBeenCalledWith(mockRequest.query);
    });

    it('should handle errors', async () => {
      // Configure mock to throw an error
      const errorMessage = 'Database error';
      userService.getAllUsersService.mockRejectedValue(new Error(errorMessage));
      
      // Execute controller function
      await getAllUsers(mockRequest, mockResponse, mockNext);
      
      // Verify next was called with the error
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNext.mock.calls[0][0].message).toBe(errorMessage);
    });
  });

  describe('getUserById', () => {
    it('should get a user by ID', async () => {
      // Mock data
      const userId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: userId,
        userID: 'SM-00001',
        username: 'testuser',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
        status: 'ACTIVE'
      };
      
      // Configure mocks
      mockRequest.params._id = userId.toString();
      userService.getUserByIdService.mockResolvedValue(mockUser);
      
      // Execute controller function
      await getUserById(mockRequest, mockResponse, mockNext);
      
      // Verify results
      expect(sendResponse).toHaveBeenCalled();
      expect(userService.getUserByIdService).toHaveBeenCalledWith(userId.toString());
    });

    it('should return 404 if user not found', async () => {
      // Configure mocks
      mockRequest.params._id = new mongoose.Types.ObjectId().toString();
      userService.getUserByIdService.mockResolvedValue(null);
      
      // Execute controller function
      await getUserById(mockRequest, mockResponse, mockNext);
      
      // Verify next was called with DatabaseError
      expect(mockNext).toHaveBeenCalledWith(expect.any(DatabaseError));
    });
  });

  describe('getUserProfile', () => {
    it('should get the current user profile', async () => {
      // Mock data
      const userId = mockRequest.user._id;
      const mockUser = {
        _id: userId,
        userID: 'SM-00001',
        username: 'testuser',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
        status: 'ACTIVE'
      };
      
      // Configure mocks
      userService.getUserByIdService.mockResolvedValue(mockUser);
      
      // Execute controller function
      await getUserProfile(mockRequest, mockResponse, mockNext);
      
      // Verify results
      expect(sendResponse).toHaveBeenCalledWith(
        mockResponse,
        200,
        'User profile retrieved successfully',
        expect.anything()
      );
      expect(userService.getUserByIdService).toHaveBeenCalledWith(userId);
    });

    it('should handle missing user in request', async () => {
      // Remove user from request
      delete mockRequest.user;
      
      // Execute controller function
      await getUserProfile(mockRequest, mockResponse, mockNext);
      
      // Verify error handling
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateUserProfile', () => {
    it('should update current user profile', async () => {
      // Mock data
      const userId = mockRequest.user._id;
      const updateData = {
        fullName: 'Updated User Name'
      };
      
      const updatedUser = {
        _id: userId,
        userID: 'SM-00001',
        username: 'testuser',
        fullName: 'Updated User Name',
        email: 'test@example.com',
        role: 'ADMIN',
        status: 'ACTIVE'
      };
      
      // Configure mocks
      mockRequest.body = updateData;
      userService.updateUserService.mockResolvedValue(updatedUser);
      
      // Execute controller function
      await updateUserProfile(mockRequest, mockResponse, mockNext);
      
      // Verify results
      expect(sendResponse).toHaveBeenCalledWith(
        mockResponse,
        200,
        'User profile updated successfully',
        expect.anything()
      );
      expect(userService.updateUserService).toHaveBeenCalledWith(userId, updateData);
    });

    it('should prevent updating restricted fields', async () => {
      // Mock data with restricted fields
      const updateData = {
        fullName: 'Updated User Name',
        role: 'SUPERADMIN', // Restricted field
        status: 'INACTIVE'  // Restricted field
      };
      
      const updatedUser = {
        _id: mockRequest.user._id,
        userID: 'SM-00001',
        username: 'testuser',
        fullName: 'Updated User Name',
        email: 'test@example.com',
        role: 'ADMIN', // Unchanged
        status: 'ACTIVE' // Unchanged
      };
      
      // Configure mocks
      mockRequest.body = updateData;
      userService.updateUserService.mockResolvedValue(updatedUser);
      
      // Execute controller function
      await updateUserProfile(mockRequest, mockResponse, mockNext);
      
      // Verify restricted fields were removed
      expect(userService.updateUserService).toHaveBeenCalledWith(
        mockRequest.user._id,
        { fullName: 'Updated User Name' } // Only non-restricted fields
      );
    });
  });

  describe('getUserByUserID', () => {
    it('should get a user by userID', async () => {
      // Mock data
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        userID: 'SM-00001',
        username: 'testuser',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
        status: 'ACTIVE'
      };
      
      // Configure mocks
      mockRequest.params.userID = 'SM-00001';
      userService.getUserByUserIDService = jest.fn().mockResolvedValue(mockUser);
      
      // Execute controller function
      await getUserByUserID(mockRequest, mockResponse, mockNext);
      
      // Verify results
      expect(sendResponse).toHaveBeenCalled();
      expect(userService.getUserByUserIDService).toHaveBeenCalledWith('SM-00001');
    });
  });

  describe('getUsersByRole', () => {
    it('should get users by role', async () => {
      // Mock data
      const mockUsers = [
        {
          _id: new mongoose.Types.ObjectId(),
          userID: 'SM-00001',
          username: 'admin1',
          fullName: 'Admin One',
          email: 'admin1@example.com',
          role: 'ADMIN',
          status: 'ACTIVE'
        },
        {
          _id: new mongoose.Types.ObjectId(),
          userID: 'SM-00002',
          username: 'admin2',
          fullName: 'Admin Two',
          email: 'admin2@example.com',
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      ];
      
      const mockPagination = {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      };
      
      // Configure mocks
      mockRequest.params.role = 'ADMIN';
      mockRequest.query = { page: 1, limit: 10 };
      userService.getUsersByRoleService = jest.fn().mockResolvedValue({
        users: mockUsers,
        pagination: mockPagination
      });
      
      // Execute controller function
      await getUsersByRole(mockRequest, mockResponse, mockNext);
      
      // Verify results
      expect(sendResponse).toHaveBeenCalledWith(
        mockResponse,
        200,
        'Users retrieved successfully',
        {
          users: expect.any(Array),
          pagination: mockPagination
        }
      );
      expect(userService.getUsersByRoleService).toHaveBeenCalledWith('ADMIN', mockRequest.query);
    });
  });
});
