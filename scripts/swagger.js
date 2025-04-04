const fs = require('fs');
const path = require('path');
const swaggerConfig = require('../src/config/swagger');

// Format JSON with indentation for readability
const formattedJson = JSON.stringify(swaggerConfig, null, 2);

// Define output path
const outputPath = path.join(__dirname, '../swagger_output.json');

// Write the file
fs.writeFileSync(outputPath, formattedJson);

console.log('Swagger documentation generated successfully!');
