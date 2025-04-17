const request = require('supertest');
const express = require('express');
const { createRateLimiter, bypassRateLimit, isAdminExempt } = require('../../src/middlewares/rateLimit.middleware');
const errorMiddleware = require('../../src/middlewares/error.middleware');

describe('Rate Limit Middleware with Admin Exemption', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    
    // Use a test-specific rate limiter with very restrictive limits for testing
    const testLimiter = createRateLimiter({
      windowMs: 1000, // 1 second window
      max: 2, // Max 2 requests per second
      skipSuccessfulRequests: false // Count all requests
    });
    
    // Mock auth middleware to set user in request
    app.use((req, res, next) => {
      // Get the role from query param or header for testing purposes
      const role = req.query.role || req.headers['x-user-role'];
      const hasExemption = req.query.exempt === 'true';
      
      if (role) {
        req.user = {
          userId: 'test-user-id',
          userID: 'USR-00011',
          role: role
        };
        
        if (hasExemption) {
          // Set an exemption valid for 1 hour
          req.user.rateLimitExemptUntil = new Date(Date.now() + 60 * 60 * 1000);
        }
      }
      
      next();
    });
    
    // Create a route with manual bypass
    app.get('/bypass-rate-limit', bypassRateLimit, testLimiter, (req, res) => {
      res.status(200).json({ message: 'Bypassed rate limit' });
    });
    
    // Apply the limiter to test routes
    app.use('/test-rate-limit', testLimiter);
    
    // Create test endpoints for different users
    app.get('/test-rate-limit', (req, res) => {
      const userRole = req.user?.role || 'unauthenticated';
      res.status(200).json({ 
        message: 'Success', 
        role: userRole,
        hasExemption: req.user?.rateLimitExemptUntil ? true : false
      });
    });
    
    // Add error handling middleware
    app.use(errorMiddleware || ((err, req, res, next) => {
      res.status(err.statusCode || 500).json({ 
        success: false, 
        error: {
          message: err.message,
          type: err.name,
          status: err.statusCode
        } 
      });
    }));
  });
  
  describe('isAdminExempt function', () => {
    it('should exempt ADMIN users', () => {
      const req = { user: { role: 'ADMIN', userID: 'USR-12345' } };
      expect(isAdminExempt(req)).toBe(true);
    });
    
    it('should exempt SUPERADMIN users', () => {
      const req = { user: { role: 'SUPERADMIN', userID: 'USR-12345' } };
      expect(isAdminExempt(req)).toBe(true);
    });
    
    it('should not exempt regular users', () => {
      const req = { user: { role: 'USER', userID: 'USR-12345' } };
      expect(isAdminExempt(req)).toBe(false);
    });
    
    it('should exempt users with valid exemption timestamp', () => {
      const req = { 
        user: { 
          role: 'USER', 
          userID: 'USR-12345',
          rateLimitExemptUntil: new Date(Date.now() + 60 * 60 * 1000) // 1 hour in future
        } 
      };
      expect(isAdminExempt(req)).toBe(true);
    });
    
    it('should not exempt users with expired exemption timestamp', () => {
      const req = { 
        user: { 
          role: 'USER', 
          userID: 'USR-12345',
          rateLimitExemptUntil: new Date(Date.now() - 60 * 60 * 1000) // 1 hour in past
        } 
      };
      expect(isAdminExempt(req)).toBe(false);
    });
  });
  
  describe('Rate limiting with role-based exemption', () => {
    it('should rate limit unauthenticated users', async () => {
      // Make requests within the rate limit (2 requests)
      for (let i = 0; i < 2; i++) {
        const response = await request(app).get('/test-rate-limit');
        expect(response.status).toBe(200);
      }
      
      // Third request should be rate limited
      const exceededResponse = await request(app).get('/test-rate-limit');
      expect(exceededResponse.status).toBe(429);
    });
    
    it('should rate limit regular authenticated users', async () => {
      // Make requests within the rate limit (2 requests)
      for (let i = 0; i < 2; i++) {
        const response = await request(app)
          .get('/test-rate-limit')
          .query({ role: 'USER' });
        expect(response.status).toBe(200);
      }
      
      // Third request should be rate limited
      const exceededResponse = await request(app)
        .get('/test-rate-limit')
        .query({ role: 'USER' });
      expect(exceededResponse.status).toBe(429);
    });
    
    it('should not rate limit ADMIN users', async () => {
      // Make many requests (more than the limit)
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/test-rate-limit')
          .query({ role: 'ADMIN' });
        expect(response.status).toBe(200);
        expect(response.body.role).toBe('ADMIN');
      }
    });
    
    it('should not rate limit SUPERADMIN users', async () => {
      // Make many requests (more than the limit)
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/test-rate-limit')
          .query({ role: 'SUPERADMIN' });
        expect(response.status).toBe(200);
        expect(response.body.role).toBe('SUPERADMIN');
      }
    });
    
    it('should not rate limit users with exemption', async () => {
      // Make many requests (more than the limit)
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/test-rate-limit')
          .query({ role: 'USER', exempt: 'true' });
        expect(response.status).toBe(200);
        expect(response.body.hasExemption).toBe(true);
      }
    });
  });
  
  describe('bypassRateLimit middleware', () => {
    it('should bypass rate limits for requests using the middleware', async () => {
      // Make many requests to a route with the bypass middleware
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/bypass-rate-limit');
        expect(response.status).toBe(200);
      }
    });
  });
  
  describe('Headers and rate limit information', () => {
    it('should include rate limit headers for regular users', async () => {
      const response = await request(app)
        .get('/test-rate-limit')
        .query({ role: 'USER' });
      
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
      expect(Number(response.headers['ratelimit-remaining'])).toBe(1); // 1 remaining of max 2
    });
    
    it('should include proper rate limit headers for admin users', async () => {
      const response = await request(app)
        .get('/test-rate-limit')
        .query({ role: 'ADMIN' });
      
      // Even though admins are exempt, headers are typically still present
      // but should indicate no rate limiting is being applied
      if (response.headers['ratelimit-limit']) {
        expect(Number(response.headers['ratelimit-remaining']) > 0).toBeTruthy();
      }
    });
  });
});
