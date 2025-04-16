Write-Host "Setting NODE_ENV to 'production'..."
$env:NODE_ENV = "production"

Write-Host "Current NODE_ENV: $env:NODE_ENV"
Write-Host "Starting server in production mode..."

# We need to modify how our dotenv config is loaded
# Instead of setting DOTENV_CONFIG_PATH, let's create a temporary script that uses direct approach
$tempScript = @'
console.log("Loading .env.production file directly...");
require("dotenv").config({ path: ".env.production" });
console.log("MONGO_URI:", process.env.MONGO_URI ? "Found" : "Not found");
console.log("NODE_ENV:", process.env.NODE_ENV);
require("./src/server.js");
'@

# Write the temporary script to a file
$tempScript | Out-File -FilePath "temp-server.js" -Encoding utf8

# Run the temporary script
Write-Host "Running server with explicit configuration..."
node temp-server.js
