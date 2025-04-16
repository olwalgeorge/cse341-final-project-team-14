const winston = require("winston");
const config = require("../config/config.js");

const fileFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack, service, module }) => {
    return `${timestamp} ${level.toUpperCase()} [${service}${module ? `:${module}` : ''}]: ${message} ${stack ? `\n${stack}` : ""}`;
  })
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ level, message, module, service }) => {
    return `${level} [${service}${module ? `:${module}` : ''}]: ${message}`;
  })
);

const createLogger = (moduleName = null) => {
  const logger = winston.createLogger({
    level: config.env === "production" ? "info" : "debug",
    defaultMeta: { 
      service: "inventory-api",
      module: moduleName
    },
    transports: [
      new winston.transports.File({
        filename: "error.log",
        level: "error",
        format: fileFormat,
      }),
      new winston.transports.File({
        filename: "combined.log",
        format: fileFormat,
      }),
    ],
  });
  
  // Always add console transport regardless of environment
  // Modified to show console output even in production mode
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
  
  return logger;
};

// Create the default logger instance
const logger = createLogger();

// Export both the default logger and the createLogger function
module.exports = {
  logger,
  createLogger
};
