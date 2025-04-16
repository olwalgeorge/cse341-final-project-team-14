console.log("Loading .env.production file directly...");
require("dotenv").config({ path: ".env.production" });
console.log("MONGO_URI:", process.env.MONGO_URI ? "Found" : "Not found");
console.log("NODE_ENV:", process.env.NODE_ENV);
require("./src/server.js");
