// src/services/user.service.js
const User = require("../models/user.model.js");

const getUserByIdService = async (id) => {
    return await User.findById(id);
};

const getUserByUserIdService = async (userId) => {
    return await User.findOne({ userID: userId });
};

const updateUserProfileService = async (id, updates) => {
    return await User.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    });
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