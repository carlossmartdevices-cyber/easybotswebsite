'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Enable pg_trgm extension for text search
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm";');

    // Add GIN indexes for text search on users
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_users_username_trgm ON users USING gin (username gin_trgm_ops);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX idx_users_first_name_trgm ON users USING gin (first_name gin_trgm_ops);
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_users_username_trgm;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_users_first_name_trgm;');
  }
};
