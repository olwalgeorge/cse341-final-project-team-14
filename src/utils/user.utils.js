// src/utils/user.utils.js

const User = require("../models/user.model.js");
const asyncHandler = require("express-async-handler");

/**
 * Transforms a user object into a standardized format for API responses.
 * @param {Object} user - The user object to transform.
 * @returns {Object} - The transformed user object.
 */
const transformUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    _id: user._id,
    userID: user.userID,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    profilePicture: user.profilePicture,
    bio: user.bio,
    website: user.website,
    location: user.location,
    isVerified: user.isVerified,
    role: user.role,
    phoneNumber: user.phoneNumber,
    preferences: user.preferences,
  };
};

/**
 * Transforms user data for updates, filtering valid fields.
 * @param {Object} data - The data object to transform.
 * @returns {Object} - The transformed data object.
 */
const transformUserData = (data) => {
  const transformedData = {};
  if (data.username) transformedData.username = data.username;
  if (data.email) transformedData.email = data.email;
  if (data.fullName) transformedData.fullName = data.fullName;
  if (data.profilePicture) transformedData.profilePicture = data.profilePicture;
  if (data.bio) transformedData.bio = data.bio;
  if (data.website) transformedData.website = data.website;
  if (data.location) transformedData.location = data.location;
  if (data.phoneNumber) transformedData.phoneNumber = data.phoneNumber;
  if (data.preferences) transformedData.preferences = data.preferences;
  if (data.role) transformedData.role = data.role;
  return transformedData;
};

const generateuserID = asyncHandler(async () => {
  const prefix = "SM-";
  const paddedLength = 5;

  // 1. Find the highest existing sequential number
  const lastUser = await User.findOne(
    { userID: { $regex: `^${prefix}` } },
    { userID: 1 },
    { sort: { userID: -1 } }
  );

  let nextNumber = 1;

  if (lastUser) {
    const lastNumber = parseInt(lastUser.userID.slice(prefix.length), 10);
    nextNumber = lastNumber + 1;
  }

  // 2. Pad the number with leading zeros
  const paddedNumber = nextNumber.toString().padStart(paddedLength, "0");

  // 3. Combine the prefix and padded number
  const userID = `${prefix}${paddedNumber}`;

  return userID;
});

module.exports = {
  transformUser,
  generateuserID,
  transformUserData,
};
