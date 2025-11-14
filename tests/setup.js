// Jest setup file for database tests

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'pnptv_test';
process.env.DB_USER = 'pnptv';
process.env.DB_PASSWORD = 'changeme';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_SSL = 'false';

// Increase timeout for database operations
jest.setTimeout(30000);
