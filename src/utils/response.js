// src/utils/response.js
const sendResponse = (res, statusCode, message, data = null, error = null) => {
    const response = {
        success: statusCode >= 200 && statusCode < 300,
        message: message
    };

    if (data) response.data = data;
    if (error) response.error = error;

    return res.status(statusCode).json(response);
};

module.exports = sendResponse;
