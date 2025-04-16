const request = require('supertest');
const express = require('express');
const { createRateLimiter } = require('../../src/middlewares/rateLimit.middleware');
const errorMiddleware = require('../../src/middlewares/error.middleware');

describe('Rate Limit Middleware', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    
    // Create a test-specific rate limiter with low limits
    const testLimiter = createRateLimiter({
      windowMs: 1000, // 1 second window
      max: 3, // Max 3 requests per second
      skipSuccessfulRequests: false // Count all requests
    });
    
    // Apply the limiter to a test route
    app.use('/test-rate-limit', testLimiter);
    
    // Create a simple test endpoint
    app.get('/test-rate-limit', (req, res) => {
      res.status(200).json({ message: 'Success' });
    });
    
    // Add error handling middleware
    app.use(errorMiddleware);
  });
  
  it('should allow requests within rate limit', async () => {
    // Make requests within the rate limit (3 requests)
    for (let i = 0; i < 3; i++) {
      const response = await request(app).get('/test-rate-limit');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
    }
  });
  
  it('should block requests that exceed rate limit', async () => {
    // Make requests within the rate limit
    for (let i = 0; i < 3; i++) {
      const response = await request(app).get('/test-rate-limit');
      expect(response.status).toBe(200);
    }
    
    // This request should be rate limited
    const exceededResponse = await request(app).get('/test-rate-limit');
    expect(exceededResponse.status).toBe(429);
    expect(exceededResponse.body.success).toBe(false);
    expect(exceededResponse.body.error).toBeDefined();
    expect(exceededResponse.body.error.type).toBe('ApiError');
  });
  
  it('should return appropriate headers for rate limiting', async () => {
    // First request should have rate limit headers
    const response = await request(app).get('/test-rate-limit');
    expect(response.headers['ratelimit-limit']).toBeDefined();
    expect(response.headers['ratelimit-remaining']).toBeDefined();
    expect(Number(response.headers['ratelimit-remaining'])).toBe(2);
  });
});