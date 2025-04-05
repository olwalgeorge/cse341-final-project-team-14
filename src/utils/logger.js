const winston = require("winston");
const config = require("../config/config.js");

const fileFormat = winston.format.combine(
    winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level, message, stack, service }) => {
        return `${timestamp} ${level.toUpperCase()} [${service}]: ${message} ${stack ? `\n${stack}` : ''}`;
    })
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
);

const logger = winston.createLogger({
    level: config.env === "production" ? "info" : "debug",
    defaultMeta: { service: "inventory-api" },
    transports: [
        new winston.transports.File({ filename: "error.log", level: "error", format: fileFormat }),
        new winston.transports.File({ filename: "combined.log", format: fileFormat }),
    ],
});

if (config.env !== "production") {
    logger.add(
        new winston.transports.Console({
            format: consoleFormat,
        })
    );
}

module.exports = logger;