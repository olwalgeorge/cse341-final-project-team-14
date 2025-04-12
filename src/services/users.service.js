// src/services/user.service.js
const User = require("../models/user.model.js");
const logger = require("../utils/logger.js");

const getUserByIdService = async (id) => {
  logger.debug(`getUserByIdService called with ID: ${id}`);
  try {
    return await User.findById(id);
  } catch (error) {
    logger.error(`Error in getUserByIdService for ID ${id}:`, error);
    throw error;
  }
};

const getUserByUserIdService = async (userId) => {
  logger.debug(`getUserByUserIdService called with userID: ${userId}`);
  try {
    return await User.findOne({ userID: userId });
  } catch (error) {
    logger.error(`Error in getUserByUserIdService for userID ${userId}:`, error);
    throw error;
  }
};

const updateUserProfileService = async (id, updates) => {
  logger.debug(`updateUserProfileService called with ID: ${id}`);
  try {
    return await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    logger.error(`Error in updateUserProfileService for ID ${id}:`, error);
    throw error;
  }
};

const deleteUserByIdService = async (id) => {
  return await User.findByIdAndDelete(id);
};

const getAllUsersService = async () => {
  return await User.find();
};

const getUserByUsernameService = async (username) => {
  return await User.findOne({ username });
};

const getUserByEmailService = async (email) => {
  return await User.findOne({ email });
};

const getUsersByRoleService = async (role) => {
  return await User.find({ role });
};

const deleteAllUsersService = async () => {
  return await User.deleteMany({});
};

const updateUserByIdService = async (id, updates) => {
  return await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
};

module.exports = {
  getUserByIdService,
  getUserByUserIdService,
  updateUserProfileService,
  deleteUserByIdService,
  getAllUsersService,
  getUserByUsernameService,
  getUserByEmailService,
  getUsersByRoleService,
  deleteAllUsersService,
  updateUserByIdService,
};
