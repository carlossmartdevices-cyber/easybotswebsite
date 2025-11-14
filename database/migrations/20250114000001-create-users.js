'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Enable UUID extension
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      telegram_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true
      },
      username: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      first_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      last_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      plan: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'basic'
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'active'
      },
      subscription_end: {
        type: Sequelize.DATE,
        allowNull: true
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      location_city: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      location_latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      location_longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },
      last_active: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('users', ['telegram_id']);
    await queryInterface.addIndex('users', ['username']);
    await queryInterface.addIndex('users', ['plan']);
    await queryInterface.addIndex('users', ['status']);
    await queryInterface.addIndex('users', ['created_at']);
    await queryInterface.addIndex('users', ['last_active']);
    await queryInterface.addIndex('users', ['subscription_end']);

    // Add check constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE users
      ADD CONSTRAINT check_status CHECK (status IN ('active', 'inactive'))
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE users
      ADD CONSTRAINT check_plan CHECK (plan IN ('basic', 'premium', 'gold'))
    `);

    // Add trigger for updated_at
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS update_users_updated_at ON users;');
    await queryInterface.dropTable('users');
  }
};
