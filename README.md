# Inventory Management API

A comprehensive RESTful API for complete inventory management, including products, orders, suppliers, and customers.

## Features

- **Authentication System**

  - Local authentication with email and password
  - OAuth integration with GitHub
  - Role-based access control (SUPERADMIN, ADMIN, USER, ORG)
  - JWT token-based authorization

- **User Management**

  - User registration and profile management
  - Role-based permissions and access control
  - Password encryption and security

- **Product Management**

  - Complete CRUD operations for inventory items
  - Search and filter products by various parameters
  - Category organization and supplier relationships

- **Order Management**

  - Order creation, tracking, and management
  - Order status tracking (pending, processing, shipped, delivered, cancelled)
  - Customer relationship tracking
  - Filtering orders by date ranges and status

- **Customer Management**

  - Customer profiles and order history
  - Search functionality for customers
  - Address and contact information management

- **Supplier Management**

  - Supplier profiles and product relationships
  - Contact information and address tracking
  - Product sourcing relationships

- **Purchase Management**

  - Track purchases from suppliers
  - Monitor payment status and due dates
  - Multiple payment status options (unpaid, partially_paid, paid)

- **API Documentation and Development**
  - Comprehensive Swagger documentation
  - Detailed API endpoint descriptions
  - Request/response schema validation

## Tech Stack

- **Backend Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js, JWT
- **Validation**: Express Validator
- **Documentation**: Swagger UI
- **Logging**: Winston
- **Error Handling**: Custom middleware
- **Frontend**: Static HTML/CSS with responsive design for dashboard

## Prerequisites

- Node.js (v14 or higher)
- MongoDB instance
- GitHub OAuth App (for GitHub authentication)

## Environment Variables

Create `.env.development` and `.env.production` files with:

```env
NODE_ENV=development|production
PORT=3000
MONGO_URI=your_mongodb_uri
SESSION_SECRET=your_session_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
CALLBACK_URL=http://localhost:3000/auth/github/callback

# Production only
RENDER_EXTERNAL_HOSTNAME=your_production_url
```

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd cse341-final-project-team-14
```

2. Install dependencies:

```bash
npm install
```

3. Generate Swagger documentation:

```bash
npm run swagger-gen
```

4. Start the server:

```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

Access the Swagger UI documentation at:

- Development: `http://localhost:3000/api-docs`
- Production: `https://your-domain.com/api-docs`

## API Endpoints

### Authentication

- POST `/auth/register` - Register new user
- POST `/auth/login` - Login user
- POST `/auth/logout` - Logout user
- GET `/auth/github` - GitHub OAuth login
- GET `/auth/github/callback` - GitHub OAuth callback

### Users

- GET `/users/profile` - Get current user profile
- PUT `/users/profile` - Update user profile
- GET `/users/:userID` - Get user by ID (SM-XXXXX format)
- GET `/users/:_id` - Get user by MongoDB ID
- PUT `/users/:_id` - Update user
- DELETE `/users/:_id` - Delete user
- GET `/users` - Get all users
- DELETE `/users` - Delete all users (SUPERADMIN only)
- GET `/users/email/:email` - Get user by email
- GET `/users/username/:username` - Get user by username
- GET `/users/role/:role` - Get users by role

### Products

- GET `/products` - Get all products with pagination and filtering
- POST `/products` - Create new product
- GET `/products/:_id` - Get product by MongoDB ID
- PUT `/products/:_id` - Update product
- DELETE `/products/:_id` - Delete product
- GET `/products/search` - Search products by term
- GET `/products/productID/:productID` - Get product by ID (PR-XXXXX format)
- GET `/products/category/:category` - Get products by category
- GET `/products/supplier/:supplierId` - Get products by supplier
- DELETE `/products` - Delete all products

### Orders

- GET `/orders` - Get all orders with filtering, pagination, and sorting
- POST `/orders` - Create new order
- GET `/orders/:_id` - Get order by MongoDB ID
- PUT `/orders/:_id` - Update order
- DELETE `/orders/:_id` - Delete order
- GET `/orders/orderID/:orderID` - Get order by ID (OR-XXXXX format)
- GET `/orders/customer/:customerId` - Get orders by customer
- GET `/orders/status/:status` - Get orders by status
- DELETE `/orders` - Delete all orders

### Suppliers

- GET `/suppliers` - Get all suppliers with pagination and filtering
- POST `/suppliers` - Create new supplier
- GET `/suppliers/:_id` - Get supplier by MongoDB ID
- PUT `/suppliers/:_id` - Update supplier
- DELETE `/suppliers/:_id` - Delete supplier
- GET `/suppliers/search` - Search suppliers by term
- GET `/suppliers/supplierID/:supplierID` - Get supplier by ID (SP-XXXXX format)
- DELETE `/suppliers` - Delete all suppliers

### Customers

- GET `/customers` - Get all customers with pagination and filtering
- POST `/customers` - Create new customer
- GET `/customers/:_id` - Get customer by MongoDB ID
- PUT `/customers/:_id` - Update customer
- DELETE `/customers/:_id` - Delete customer
- GET `/customers/search` - Search customers by name or email
- GET `/customers/customerID/:customerID` - Get customer by ID (CU-XXXXX format)
- GET `/customers/email/:email` - Get customer by email
- DELETE `/customers` - Delete all customers

### Purchases

- GET `/purchases` - Get all purchases with filtering and pagination
- POST `/purchases` - Create new purchase
- GET `/purchases/:_id` - Get purchase by MongoDB ID
- PUT `/purchases/:_id` - Update purchase
- DELETE `/purchases/:_id` - Delete purchase
- GET `/purchases/purchaseID/:purchaseID` - Get purchase by ID (PU-XXXXX format)
- GET `/purchases/supplier/:supplierId` - Get purchases by supplier
- GET `/purchases/status/:status` - Get purchases by status
- DELETE `/purchases` - Delete all purchases

## Project Structure

```
src/
├── app.js                 # Express app setup
├── auth/                  # Authentication strategies
├── config/                # Configuration files
│   └── config.js          # Environment configuration
├── controllers/           # Request handlers
│   ├── auth.controller.js
│   ├── customer.controller.js
│   ├── order.controller.js
│   ├── product.controller.js
│   ├── purchase.controller.js
│   ├── supplier.controller.js
│   └── user.controller.js
├── docs/                  # API documentation
│   ├── auth.docs.js
│   ├── components.js
│   ├── customer.docs.js
│   ├── order.docs.js
│   ├── product.docs.js
│   ├── purchase.docs.js
│   ├── supplier.docs.js
│   └── user.docs.js
├── middleware/            # Express middlewares
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   └── validation.middleware.js
├── models/                # Mongoose models
│   ├── customer.model.js
│   ├── order.model.js
│   ├── product.model.js
│   ├── purchase.model.js
│   ├── supplier.model.js
│   └── user.model.js
├── routes/                # Express routes
│   ├── auth.routes.js
│   ├── customer.routes.js
│   ├── index.js
│   ├── order.routes.js
│   ├── product.routes.js
│   ├── purchase.routes.js
│   ├── supplier.routes.js
│   └── user.routes.js
├── services/              # Business logic
│   ├── auth.service.js
│   ├── customer.service.js
│   ├── order.service.js
│   ├── product.service.js
│   ├── purchase.service.js
│   ├── supplier.service.js
│   └── user.service.js
├── utils/                 # Utility functions
│   ├── customer.utils.js
│   ├── logger.js
│   ├── order.utils.js
│   ├── product.utils.js
│   ├── purchase.utils.js
│   └── supplier.utils.js
└── server.js              # Server entry point
```

## Public Directory Structure

```
public/
├── images/               # Image assets
├── scripts/              # JavaScript files
├── styles/               # CSS files
│   └── styles.css        # Main stylesheet
├── dashboard.html        # Dashboard interface
├── index.html            # Home page
├── login.html            # Login page
└── register.html         # Registration page
```

## Error Handling

The API implements comprehensive error handling:

- Validation errors with detailed messages
- Authentication and authorization errors
- Resource not found errors
- Duplicate entry conflicts
- Server errors with proper logging

## Testing

The project structure includes support for testing:

- Controllers
- Services
- Models
- Middleware
- Routes

Run tests with:

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Team Members

- Tro Opong Ebenezer
- Jules Samuel
- Santiago Ariel Chaparro
- Ndikum Sabastine Ndifor
- George Omondi Olwal
