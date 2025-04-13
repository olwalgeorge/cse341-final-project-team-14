// This file runs before Jest loads any tests
// You can add global setup/teardown or mock configurations here

// For example, you might want to set environment variables for testing
process.env.NODE_ENV = 'test';

// Mock or silence certain console methods during tests if needed
// console.error = jest.fn();
// console.warn = jest.fn();

// Add global teardown if needed
afterAll(async () => {
  // Any cleanup required after all tests run
});
