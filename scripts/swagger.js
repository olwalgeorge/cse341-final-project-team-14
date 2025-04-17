const fs = require("fs");
const path = require("path");
const swaggerConfig = require("../src/config/swagger");

// Format JSON with indentation for readability
const formattedJson = JSON.stringify(swaggerConfig, null, 2);

// Define output path
const outputPath = path.join(__dirname, "../swagger_output.json");

// Write the file
fs.writeFileSync(outputPath, formattedJson);

console.log("Swagger generation completed");
console.log("Documentation available at: http://localhost:3000/api-docs");
