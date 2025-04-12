const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Supplier = require('../../src/models/supplier.model');

describe('Suppliers Routes Tests', () => {
  const validSupplier = {
    supplierID: 'SP-00001',
    name: 'Test Supplier',
    contact: {
      phone: '1234567890',
      email: 'test@supplier.com'
    },
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      postalCode: '12345',
      country: 'Test Country'
    },
    status: 'ACTIVE' // Added status field with current enum value
  };

  // Mock user for authentication
  let authToken;
  
  // Mock authentication middleware
  jest.mock('../../src/middlewares/auth.middleware', () => {
    return jest.fn((req, res, next) => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        userID: 'SM-00001',
        username: 'testuser',
        role: 'ADMIN'
      };
      next();
    });
  });

  beforeEach(async () => {
    // Clear the suppliers collection before each test
    await Supplier.deleteMany({});
  });

  describe('GET /suppliers', () => {
    it('should get all suppliers', async () => {
      // Create a test supplier first
      await Supplier.create(validSupplier);
      
      // Make the API request
      const response = await request(app)
        .get('/suppliers')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Check response
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.suppliers).toBeInstanceOf(Array);
      expect(response.body.data.suppliers.length).toBe(1);
      expect(response.body.data.suppliers[0].name).toBe(validSupplier.name);
    });

    it('should support pagination', async () => {
      // Create multiple suppliers
      await Supplier.create(validSupplier);
      await Supplier.create({
        ...validSupplier,
        supplierID: 'SP-00002',
        name: 'Second Supplier',
        contact: {
          ...validSupplier.contact,
          email: 'second@supplier.com'
        }
      });
      await Supplier.create({
        ...validSupplier,
        supplierID: 'SP-00003',
        name: 'Third Supplier',
        contact: {
          ...validSupplier.contact,
          email: 'third@supplier.com'
        }
      });
      
      // Make request with pagination
      const response = await request(app)
        .get('/suppliers?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Check response
      expect(response.status).toBe(200);
      expect(response.body.data.suppliers.length).toBe(2);
      expect(response.body.data.pagination.total).toBe(3);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /suppliers/:_id', () => {
    it('should get a supplier by ID', async () => {
      // Create a test supplier
      const supplier = await Supplier.create(validSupplier);
      
      // Make request
      const response = await request(app)
        .get(`/suppliers/${supplier._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      // Check response
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.supplierID).toBe(validSupplier.supplierID);
      expect(response.body.data.name).toBe(validSupplier.name);
    });

    it('should return 404 for non-existent supplier', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      // Make request
      const response = await request(app)
        .get(`/suppliers/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      // Check response
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /suppliers', () => {
    it('should create a new supplier', async () => {
      // Prepare data (without supplierID - it will be generated)
      const newSupplier = {
        name: 'New Supplier',
        contact: {
          phone: '9876543210',
          email: 'new@supplier.com'
        },
        address: {
          street: '456 New St',
          city: 'New City',
          state: 'New State',
          postalCode: '54321',
          country: 'New Country'
        },
        status: 'ACTIVE' // Include status
      };
      
      // Make request
      const response = await request(app)
        .post('/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newSupplier);
      
      // Check response
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe(newSupplier.name);
      expect(response.body.data.status).toBe(newSupplier.status); // Check status in response
      expect(response.body.data.supplierID).toBe('SP-00001'); // From our mock
      
      // Verify supplier was created in database
      const savedSupplier = await Supplier.findOne({ name: newSupplier.name });
      expect(savedSupplier).toBeTruthy();
      expect(savedSupplier.status).toBe(newSupplier.status); // Check status in DB
    });

    it('should return validation error for invalid data', async () => {
      // Incomplete supplier data missing required fields
      const invalidSupplier = {
        name: 'Invalid Supplier'
        // Missing contact and address
      };
      
      // Make request
      const response = await request(app)
        .post('/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidSupplier);
      
      // Check response
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /suppliers/:_id', () => {
    it('should update an existing supplier', async () => {
      // Create a test supplier
      const supplier = await Supplier.create(validSupplier);
      
      // Update data
      const updateData = {
        name: 'Updated Supplier',
        contact: {
          phone: '5555555555',
          email: 'updated@supplier.com'
        },
        status: 'INACTIVE' // Change status
      };
      
      // Make request
      const response = await request(app)
        .put(`/suppliers/${supplier._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);
      
      // Check response
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.contact.phone).toBe(updateData.contact.phone);
      expect(response.body.data.status).toBe(updateData.status); // Check updated status
      
      // Verify database was updated
      const updatedSupplier = await Supplier.findById(supplier._id);
      expect(updatedSupplier.name).toBe(updateData.name);
      expect(updatedSupplier.status).toBe(updateData.status); // Check status in DB
    });
  });

  describe('DELETE /suppliers/:_id', () => {
    it('should delete an existing supplier', async () => {
      // Create a test supplier
      const supplier = await Supplier.create(validSupplier);
      
      // Make request
      const response = await request(app)
        .delete(`/suppliers/${supplier._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      // Check response
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      
      // Verify supplier was deleted
      const deletedSupplier = await Supplier.findById(supplier._id);
      expect(deletedSupplier).toBeNull();
    });
  });
});