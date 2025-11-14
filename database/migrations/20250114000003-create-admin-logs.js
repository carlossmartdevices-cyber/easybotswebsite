'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admin_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      admin_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      target: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: '{}'
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'success'
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      }
    });

    // Add indexes
    await queryInterface.addIndex('admin_logs', ['admin_id']);
    await queryInterface.addIndex('admin_logs', ['action']);
    await queryInterface.addIndex('admin_logs', ['timestamp']);
    await queryInterface.addIndex('admin_logs', ['target']);

    // Add check constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE admin_logs
      ADD CONSTRAINT check_log_status CHECK (status IN ('success', 'failed', 'partial'))
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('admin_logs');
  }
};
