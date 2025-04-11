const mongoose = require('mongoose');
const Supplier = require('../../src/models/supplier.model');

describe('Supplier Model Tests', () => {
  const supplierData = {
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
    }
  };

  // Clean up the database after tests
  afterAll(async () => {
    await Supplier.deleteMany({});
  });

  it('should create a new supplier successfully', async () => {
    const supplier = new Supplier(supplierData);
    const savedSupplier = await supplier.save();
    
    expect(savedSupplier._id).toBeDefined();
    expect(savedSupplier.supplierID).toBe(supplierData.supplierID);
    expect(savedSupplier.name).toBe(supplierData.name);
    expect(savedSupplier.contact.phone).toBe(supplierData.contact.phone);
    expect(savedSupplier.contact.email).toBe(supplierData.contact.email);
  });

  it('should fail to create supplier without required fields', async () => {
    const invalidSupplier = new Supplier({
      name: 'Incomplete Supplier'
      // Missing supplierID and contact fields
    });
    
    let error;
    try {
      await invalidSupplier.validate();
    } catch (err) {
      error = err;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.supplierID).toBeDefined();
    // Check if we have errors for contact.phone
    expect(error.errors['contact.phone']).toBeDefined();
  });

  it('should update the updatedAt field when saving', async () => {
    const supplier = new Supplier(supplierData);
    const savedSupplier = await supplier.save();
    
    const originalUpdatedAt = savedSupplier.updatedAt;
    
    // Wait a moment to ensure time difference
    await new Promise(resolve => setTimeout(resolve, 100));
    
    savedSupplier.name = 'Updated Supplier Name';
    await savedSupplier.save();
    
    expect(savedSupplier.updatedAt).not.toEqual(originalUpdatedAt);
  });

  it('should find supplier by mongodb ObjectId', async () => {
    // Create a supplier
    const supplier = new Supplier(supplierData);
    const savedSupplier = await supplier.save();
    
    // Find by ObjectId
    const foundSupplier = await Supplier.findById(new mongoose.Types.ObjectId(savedSupplier._id));
    
    expect(foundSupplier).toBeDefined();
    expect(foundSupplier.name).toBe(supplierData.name);
  });
});