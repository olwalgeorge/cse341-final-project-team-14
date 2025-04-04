const sendResponse = require("../utils/response.js");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger.js");
const createHttpError = require("http-errors");
const { transformUser } = require("../utils/user.utils.js");
const authService = require("../services/auth.service.js");

/**
 * @desc    Register new user
 * @route   POST /auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res, next) => {
    logger.info("Register endpoint called");
    logger.debug("Request body:", req.body);

    try {
        const user = await authService.registerUser(req.body);
        // Log in the user after registration
        req.login(user, (err) => {
            if (err) {
                logger.error("Error logging in after registration:", err);
                return next(createHttpError(500, "Registration successful but login failed"));
            }
            const transformedUser = transformUser(user);
            sendResponse(res, 201, "Registration successful", { user: transformedUser });
        });
    } catch (error) {
        logger.error("Error during registration:", error);
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((val) => val.message);
            return next(createHttpError(400, "Validation error", { message: errors.join(". ") }));
        }
        next(createHttpError(500, "Failed to register user", { message: error.message }));
    }
});

/**
 * @desc    Login user
 * @route   POST /auth/login
 * @access  Public
 */
const loginSuccess = (req, res) => {
    logger.info(`User ${req.user.username} logged in successfully.`);
    const transformedUser = transformUser(req.user);
    sendResponse(res, 200, "Login successful", { user: transformedUser });
};

/**
 * @desc    Logout user
 * @route   POST /auth/logout
 * @access  Private
 */
const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            logger.error("Error during logout:", err);
            // eslint-disable-next-line
            return next(createHttpError(500, "Internal server error during logout", { message: err.message }));
        }
        logger.info(`User logged out successfully.`);
        sendResponse(res, 200, "Logged out successfully");
    });
};

module.exports = {
    register,
    loginSuccess,
    logout,
};
