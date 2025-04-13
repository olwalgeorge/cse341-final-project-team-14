<#
.SYNOPSIS
PowerShell script to run Jest tests for different modules of the Inventory Management API

.DESCRIPTION
This script provides commands to run specific test files or groups of tests for the application.
Each section contains commands for different parts of the application (users, suppliers, etc.)
#>

# Run all tests
Write-Host "======= Commands to Run All Tests =======" -ForegroundColor Green
Write-Host "npm test" -ForegroundColor Yellow

Write-Host "`n======= User Tests =======" -ForegroundColor Green

# User Model Tests
Write-Host "# Run User Model Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/models/user.model.test.js" -ForegroundColor Yellow

# User Service Tests
Write-Host "`n# Run User Service Tests" -ForegroundColor Cyan  
Write-Host "npm test -- __tests__/services/users.service.test.js" -ForegroundColor Yellow

# User Controller Tests
Write-Host "`n# Run User Controller Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/controllers/users.controller.test.js" -ForegroundColor Yellow

# User Routes Tests
Write-Host "`n# Run User Routes Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/routes/users.routes.test.js" -ForegroundColor Yellow

# User Utils Tests
Write-Host "`n# Run User Utils Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/utils/user.utils.test.js" -ForegroundColor Yellow

# User Validator Tests
Write-Host "`n# Run User Validator Tests" -ForegroundColor Cyan  
Write-Host "npm test -- __tests__/validators/user.validator.test.js" -ForegroundColor Yellow

# Run All User Tests Together
Write-Host "`n# Run All User Tests Together" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/models/user.model.test.js __tests__/services/users.service.test.js __tests__/controllers/users.controller.test.js __tests__/routes/users.routes.test.js __tests__/utils/user.utils.test.js __tests__/validators/user.validator.test.js" -ForegroundColor Yellow

Write-Host "`n======= Supplier Tests =======" -ForegroundColor Green

# Supplier Model Tests
Write-Host "# Run Supplier Model Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/models/supplier.model.test.js" -ForegroundColor Yellow

# Supplier Service Tests
Write-Host "`n# Run Supplier Service Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/services/suppliers.service.test.js" -ForegroundColor Yellow

# Supplier Controller Tests
Write-Host "`n# Run Supplier Controller Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/controllers/suppliers.controller.test.js" -ForegroundColor Yellow
Write-Host "# Run with increased timeout and detect open handles" -ForegroundColor Cyan
Write-Host "npx jest __tests__/controllers/suppliers.controller.test.js --testTimeout=30000 --detectOpenHandles" -ForegroundColor Yellow

# Supplier Routes Tests
Write-Host "`n# Run Supplier Routes Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/routes/suppliers.routes.test.js" -ForegroundColor Yellow

# Supplier Utils Tests
Write-Host "`n# Run Supplier Utils Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/utils/supplier.utils.test.js" -ForegroundColor Yellow

# Supplier Validator Tests
Write-Host "`n# Run Supplier Validator Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/validators/supplier.validator.test.js" -ForegroundColor Yellow

# Run All Supplier Tests Together
Write-Host "`n# Run All Supplier Tests Together" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/models/supplier.model.test.js __tests__/services/suppliers.service.test.js __tests__/controllers/suppliers.controller.test.js __tests__/routes/suppliers.routes.test.js __tests__/utils/supplier.utils.test.js __tests__/validators/supplier.validator.test.js" -ForegroundColor Yellow

Write-Host "`n======= Customer Tests =======" -ForegroundColor Green

# Customer Model Tests
Write-Host "# Run Customer Model Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/models/customer.model.test.js" -ForegroundColor Yellow

# Customer Service Tests
Write-Host "`n# Run Customer Service Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/services/customers.service.test.js" -ForegroundColor Yellow

# Customer Controller Tests
Write-Host "`n# Run Customer Controller Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/controllers/customers.controller.test.js" -ForegroundColor Yellow
Write-Host "# Run with increased timeout and detect open handles" -ForegroundColor Cyan
Write-Host "npx jest __tests__/controllers/customers.controller.test.js --testTimeout=30000 --detectOpenHandles" -ForegroundColor Yellow

# Customer Routes Tests
Write-Host "`n# Run Customer Routes Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/routes/customers.routes.test.js" -ForegroundColor Yellow

# Customer Utils Tests
Write-Host "`n# Run Customer Utils Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/utils/customer.utils.test.js" -ForegroundColor Yellow

# Customer Validator Tests
Write-Host "`n# Run Customer Validator Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/validators/customer.validator.test.js" -ForegroundColor Yellow

# Run All Customer Tests Together
Write-Host "`n# Run All Customer Tests Together" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/models/customer.model.test.js __tests__/services/customers.service.test.js __tests__/controllers/customers.controller.test.js __tests__/routes/customers.routes.test.js __tests__/utils/customer.utils.test.js __tests__/validators/customer.validator.test.js" -ForegroundColor Yellow

Write-Host "`n======= Product Tests =======" -ForegroundColor Green

# Product Model Tests
Write-Host "# Run Product Model Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/models/product.model.test.js" -ForegroundColor Yellow

# Product Service Tests
Write-Host "`n# Run Product Service Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/services/products.service.test.js" -ForegroundColor Yellow

# Product Controller Tests
Write-Host "`n# Run Product Controller Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/controllers/products.controller.test.js" -ForegroundColor Yellow
Write-Host "# Run with increased timeout and detect open handles" -ForegroundColor Cyan
Write-Host "npx jest __tests__/controllers/products.controller.test.js --testTimeout=30000 --detectOpenHandles" -ForegroundColor Yellow

# Product Routes Tests
Write-Host "`n# Run Product Routes Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/routes/products.routes.test.js" -ForegroundColor Yellow

# Product Utils Tests
Write-Host "`n# Run Product Utils Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/utils/product.utils.test.js" -ForegroundColor Yellow

# Product Validator Tests
Write-Host "`n# Run Product Validator Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/validators/product.validator.test.js" -ForegroundColor Yellow

# Run All Product Tests Together
Write-Host "`n# Run All Product Tests Together" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/models/product.model.test.js __tests__/services/products.service.test.js __tests__/controllers/products.controller.test.js __tests__/routes/products.routes.test.js __tests__/utils/product.utils.test.js __tests__/validators/product.validator.test.js" -ForegroundColor Yellow

Write-Host "`n======= Warehouse Tests =======" -ForegroundColor Green

# Warehouse Model Tests
Write-Host "# Run Warehouse Model Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/models/warehouse.model.test.js" -ForegroundColor Yellow

# Warehouse Service Tests
Write-Host "`n# Run Warehouse Service Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/services/warehouses.service.test.js" -ForegroundColor Yellow

# Warehouse Controller Tests
Write-Host "`n# Run Warehouse Controller Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/controllers/warehouses.controller.test.js" -ForegroundColor Yellow
Write-Host "# Run with increased timeout and detect open handles" -ForegroundColor Cyan
Write-Host "npx jest __tests__/controllers/warehouses.controller.test.js --testTimeout=30000 --detectOpenHandles" -ForegroundColor Yellow

# Warehouse Routes Tests
Write-Host "`n# Run Warehouse Routes Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/routes/warehouses.routes.test.js" -ForegroundColor Yellow

# Warehouse Utils Tests
Write-Host "`n# Run Warehouse Utils Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/utils/warehouse.utils.test.js" -ForegroundColor Yellow

# Warehouse Validator Tests
Write-Host "`n# Run Warehouse Validator Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/validators/warehouse.validator.test.js" -ForegroundColor Yellow

# Run All Warehouse Tests Together
Write-Host "`n# Run All Warehouse Tests Together" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/models/warehouse.model.test.js __tests__/services/warehouses.service.test.js __tests__/controllers/warehouses.controller.test.js __tests__/routes/warehouses.routes.test.js __tests__/utils/warehouse.utils.test.js __tests__/validators/warehouse.validator.test.js" -ForegroundColor Yellow

Write-Host "`n======= Inventory Tests =======" -ForegroundColor Green

# Inventory Model Tests
Write-Host "# Run Inventory Model Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/models/inventory.model.test.js" -ForegroundColor Yellow

# Inventory Service Tests
Write-Host "`n# Run Inventory Service Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/services/inventory.service.test.js" -ForegroundColor Yellow

# Inventory Controller Tests
Write-Host "`n# Run Inventory Controller Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/controllers/inventory.controller.test.js" -ForegroundColor Yellow
Write-Host "# Run with increased timeout and detect open handles" -ForegroundColor Cyan
Write-Host "npx jest __tests__/controllers/inventory.controller.test.js --testTimeout=30000 --detectOpenHandles" -ForegroundColor Yellow

# Inventory Routes Tests
Write-Host "`n# Run Inventory Routes Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/routes/inventory.routes.test.js" -ForegroundColor Yellow

# Inventory Utils Tests
Write-Host "`n# Run Inventory Utils Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/utils/inventory.utils.test.js" -ForegroundColor Yellow

# Inventory Validator Tests
Write-Host "`n# Run Inventory Validator Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/validators/inventory.validator.test.js" -ForegroundColor Yellow

# Run All Inventory Tests Together
Write-Host "`n# Run All Inventory Tests Together" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/models/inventory.model.test.js __tests__/services/inventory.service.test.js __tests__/controllers/inventory.controller.test.js __tests__/routes/inventory.routes.test.js __tests__/utils/inventory.utils.test.js __tests__/validators/inventory.validator.test.js" -ForegroundColor Yellow

Write-Host "`n======= Inventory Returns Tests =======" -ForegroundColor Green

# Inventory Returns Model Tests
Write-Host "# Run Inventory Returns Model Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/models/inventoryreturns.model.test.js" -ForegroundColor Yellow

# Inventory Returns Service Tests
Write-Host "`n# Run Inventory Returns Service Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/services/inventoryreturns.service.test.js" -ForegroundColor Yellow

# Inventory Returns Controller Tests
Write-Host "`n# Run Inventory Returns Controller Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/controllers/inventoryreturns.controller.test.js" -ForegroundColor Yellow
Write-Host "# Run with increased timeout and detect open handles" -ForegroundColor Cyan
Write-Host "npx jest __tests__/controllers/inventoryreturns.controller.test.js --testTimeout=30000 --detectOpenHandles" -ForegroundColor Yellow

# Inventory Returns Routes Tests
Write-Host "`n# Run Inventory Returns Routes Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/routes/inventoryreturns.routes.test.js" -ForegroundColor Yellow

# Inventory Returns Utils Tests
Write-Host "`n# Run Inventory Returns Utils Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/utils/inventoryreturns.utils.test.js" -ForegroundColor Yellow

# Inventory Returns Validator Tests
Write-Host "`n# Run Inventory Returns Validator Tests" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/validators/inventoryreturns.validator.test.js" -ForegroundColor Yellow

# Run All Inventory Returns Tests Together
Write-Host "`n# Run All Inventory Returns Tests Together" -ForegroundColor Cyan
Write-Host "npm test -- __tests__/models/inventoryreturns.model.test.js __tests__/services/inventoryreturns.service.test.js __tests__/controllers/inventoryreturns.controller.test.js __tests__/routes/inventoryreturns.routes.test.js __tests__/utils/inventoryreturns.utils.test.js __tests__/validators/inventoryreturns.validator.test.js" -ForegroundColor Yellow

Write-Host "`n======= Test Coverage Commands =======" -ForegroundColor Green

# Coverage for All Tests
Write-Host "# Generate Coverage Report for All Tests" -ForegroundColor Cyan
Write-Host "npm test -- --coverage" -ForegroundColor Yellow

# Coverage for Specific Module
Write-Host "`n# Coverage for User Model" -ForegroundColor Cyan
Write-Host "npm test -- --coverage --collectCoverageFrom='src/models/user.model.js' __tests__/models/user.model.test.js" -ForegroundColor Yellow

Write-Host "`n# Coverage for Supplier Model" -ForegroundColor Cyan
Write-Host "npm test -- --coverage --collectCoverageFrom='src/models/supplier.model.js' __tests__/models/supplier.model.test.js" -ForegroundColor Yellow

Write-Host "`n# Coverage for Customer Model" -ForegroundColor Cyan
Write-Host "npm test -- --coverage --collectCoverageFrom='src/models/customer.model.js' __tests__/models/customer.model.test.js" -ForegroundColor Yellow

Write-Host "`n# Coverage for Product Model" -ForegroundColor Cyan
Write-Host "npm test -- --coverage --collectCoverageFrom='src/models/product.model.js' __tests__/models/product.model.test.js" -ForegroundColor Yellow

Write-Host "`n# Coverage for Warehouse Model" -ForegroundColor Cyan
Write-Host "npm test -- --coverage --collectCoverageFrom='src/models/warehouse.model.js' __tests__/models/warehouse.model.test.js" -ForegroundColor Yellow

Write-Host "`n# Coverage for Inventory Model" -ForegroundColor Cyan
Write-Host "npm test -- --coverage --collectCoverageFrom='src/models/inventory.model.js' __tests__/models/inventory.model.test.js" -ForegroundColor Yellow

# Coverage for Inventory Returns Model
Write-Host "`n# Coverage for Inventory Returns Model" -ForegroundColor Cyan
Write-Host "npm test -- --coverage --collectCoverageFrom='src/models/inventoryreturns.model.js' __tests__/models/inventoryreturns.model.test.js" -ForegroundColor Yellow

Write-Host "`n======= Watch Mode Commands =======" -ForegroundColor Green
Write-Host "# Run Tests in Watch Mode" -ForegroundColor Cyan
Write-Host "npm run test:watch" -ForegroundColor Yellow
Write-Host "`n# Run Specific Test in Watch Mode" -ForegroundColor Cyan
Write-Host "npm run test:watch -- __tests__/models/user.model.test.js" -ForegroundColor Yellow

Write-Host "`n======= Troubleshooting Commands =======" -ForegroundColor Green
Write-Host "# Run tests with increased timeout" -ForegroundColor Cyan
Write-Host "npx jest --testTimeout=30000" -ForegroundColor Yellow

Write-Host "`n# Detect open handles (when tests don't exit properly)" -ForegroundColor Cyan
Write-Host "npx jest --detectOpenHandles" -ForegroundColor Yellow

Write-Host "`n# Run tests with more detailed logging" -ForegroundColor Cyan
Write-Host "npx jest --verbose" -ForegroundColor Yellow

Write-Host "`n# Run a specific test (by name pattern)" -ForegroundColor Cyan
Write-Host "npx jest -t 'should create a valid user'" -ForegroundColor Yellow

Write-Host "`n======= Usage =======" -ForegroundColor Green
Write-Host "To run any of these commands, copy the command and paste it into your PowerShell terminal."
Write-Host "Example: 'npm test -- __tests__/models/user.model.test.js'"

