const {
  userUpdateValidationRules,
  userIDValidationRules,
  user_IdValidationRules,
  usernameValidationRules,
  emailValidationRules,
  roleValidationRules,
  searchValidationRules,
  isValidEmail,
  isValidUsernameBody,
  isValidRoleBody
} = require('../../src/validators/user.validator');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Mock express request and response
const mockRequest = (params = {}, body = {}, query = {}) => ({
  params,
  body,
  query
});

// Helper to run validations and check for errors
const runValidation = async (validationRules, req) => {
  // Create a middleware chain from the validation rules
  const middlewares = validationRules();
  
  // Run each validator on the request
  const promises = middlewares.map(middleware => middleware(req, {}, () => {}));
  await Promise.all(promises);
  
  // Get validation result
  return validationResult(req);
};

describe('User Validators', () => {
  describe('userIDValidationRules', () => {
    it('should pass valid SM-xxxxx format user ID', async () => {
      const req = mockRequest({ userID: 'SM-00001' });
      const result = await runValidation(userIDValidationRules, req);
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail with invalid SM-xxxxx format', async () => {
      const req = mockRequest({ userID: 'SM-1234' });
      const result = await runValidation(userIDValidationRules, req);
      expect(result.isEmpty()).toBe(false);
      
      // Also test completely invalid format
      const req2 = mockRequest({ userID: 'INVALID' });
      const result2 = await runValidation(userIDValidationRules, req2);
      expect(result2.isEmpty()).toBe(false);
    });
  });

  describe('user_IdValidationRules', () => {
    it('should pass valid MongoDB ObjectId', async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const req = mockRequest({ user_Id: validId });
      const result = await runValidation(user_IdValidationRules, req);
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail with invalid MongoDB ObjectId', async () => {
      const req = mockRequest({ user_Id: 'invalid-id' });
      const result = await runValidation(user_IdValidationRules, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe('usernameValidationRules', () => {
    it('should pass valid username', async () => {
      const req = mockRequest({ username: 'validusername' });
      const result = await runValidation(usernameValidationRules, req);
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail with username that is too short', async () => {
      const req = mockRequest({ username: 'ab' }); // Less than 3 chars
      const result = await runValidation(usernameValidationRules, req);
      expect(result.isEmpty()).toBe(false);
    });

    it('should fail with username that is too long', async () => {
      const req = mockRequest({ username: 'x'.repeat(21) }); // More than 20 chars
      const result = await runValidation(usernameValidationRules, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe('emailValidationRules', () => {
    it('should pass valid email', async () => {
      const req = mockRequest({ email: 'test@example.com' });
      const result = await runValidation(emailValidationRules, req);
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail with invalid email format', async () => {
      const req = mockRequest({ email: 'invalid-email' });
      const result = await runValidation(emailValidationRules, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe('roleValidationRules', () => {
    it('should pass valid role', async () => {
      const validRoles = ['SUPERADMIN', 'ADMIN', 'USER', 'ORG'];
      
      for (const role of validRoles) {
        const req = mockRequest({ role });
        const result = await runValidation(roleValidationRules, req);
        expect(result.isEmpty()).toBe(true);
      }
    });

    it('should fail with invalid role', async () => {
      const req = mockRequest({ role: 'INVALID_ROLE' });
      const result = await runValidation(roleValidationRules, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe('searchValidationRules', () => {
    it('should pass valid search term', async () => {
      const req = mockRequest({}, {}, { term: 'valid search' });
      const result = await runValidation(searchValidationRules, req);
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail with search term that is too short', async () => {
      const req = mockRequest({}, {}, { term: 'a' }); // Less than 2 chars
      const result = await runValidation(searchValidationRules, req);
      expect(result.isEmpty()).toBe(false);
    });

    it('should fail with missing search term', async () => {
      const req = mockRequest();
      const result = await runValidation(searchValidationRules, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe('userUpdateValidationRules', () => {
    it('should pass valid update data', async () => {
      const req = mockRequest({}, {
        fullName: 'Valid Name',
        email: 'valid@example.com',
        username: 'validusername',
        role: 'ADMIN'
      });
      const result = await runValidation(userUpdateValidationRules, req);
      expect(result.isEmpty()).toBe(true);
    });

    it('should pass with partial update data', async () => {
      const req = mockRequest({}, { fullName: 'Valid Name' });
      const result = await runValidation(userUpdateValidationRules, req);
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail with invalid email', async () => {
      const req = mockRequest({}, { email: 'invalid-email' });
      const result = await runValidation(userUpdateValidationRules, req);
      expect(result.isEmpty()).toBe(false);
    });

    it('should fail with invalid username', async () => {
      const req = mockRequest({}, { username: '123invalid' }); // Starting with digits
      const result = await runValidation(userUpdateValidationRules, req);
      expect(result.isEmpty()).toBe(false);
    });

    it('should fail with invalid role', async () => {
      const req = mockRequest({}, { role: 'INVALID_ROLE' });
      const result = await runValidation(userUpdateValidationRules, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe('Individual Validator Functions', () => {
    describe('isValidEmail', () => {
      it('should create a validator that checks email format', async () => {
        const validator = isValidEmail('testField', 'Invalid email');
        
        // Test with a request that has valid email
        const reqValid = mockRequest({}, { testField: 'valid@example.com' });
        await validator(reqValid, {}, () => {});
        const resultValid = validationResult(reqValid);
        expect(resultValid.isEmpty()).toBe(true);
        
        // Test with a request that has invalid email
        const reqInvalid = mockRequest({}, { testField: 'invalid-email' });
        await validator(reqInvalid, {}, () => {});
        const resultInvalid = validationResult(reqInvalid);
        expect(resultInvalid.isEmpty()).toBe(false);
      });
    });

    describe('isValidUsernameBody', () => {
      it('should create a validator that checks username format', async () => {
        const validator = isValidUsernameBody('testField', 'Invalid username');
        
        // Test with a request that has valid username
        const reqValid = mockRequest({}, { testField: 'validusername' });
        await validator(reqValid, {}, () => {});
        const resultValid = validationResult(reqValid);
        expect(resultValid.isEmpty()).toBe(true);
        
        // Test with a request that has invalid username
        const reqInvalid = mockRequest({}, { testField: '123invalid' });
        await validator(reqInvalid, {}, () => {});
        const resultInvalid = validationResult(reqInvalid);
        expect(resultInvalid.isEmpty()).toBe(false);
      });
    });

    describe('isValidRoleBody', () => {
      it('should create a validator that checks role against allowed values', async () => {
        const validator = isValidRoleBody('testField', ['ADMIN', 'USER'], 'Invalid role');
        
        // Test with a request that has valid role
        const reqValid = mockRequest({}, { testField: 'ADMIN' });
        await validator(reqValid, {}, () => {});
        const resultValid = validationResult(reqValid);
        expect(resultValid.isEmpty()).toBe(true);
        
        // Test with a request that has invalid role
        const reqInvalid = mockRequest({}, { testField: 'INVALID_ROLE' });
        await validator(reqInvalid, {}, () => {});
        const resultInvalid = validationResult(reqInvalid);
        expect(resultInvalid.isEmpty()).toBe(false);
      });
    });
  });
});
