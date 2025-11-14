'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('broadcasts', {
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
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      target_group: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      file_id: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'sent'
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      }
    });

    // Add indexes
    await queryInterface.addIndex('broadcasts', ['admin_id']);
    await queryInterface.addIndex('broadcasts', ['user_id']);
    await queryInterface.addIndex('broadcasts', ['sent_at']);
    await queryInterface.addIndex('broadcasts', ['status']);
    await queryInterface.addIndex('broadcasts', ['target_group']);

    // Add check constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE broadcasts
      ADD CONSTRAINT check_broadcast_type CHECK (type IN ('text', 'photo', 'video'))
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE broadcasts
      ADD CONSTRAINT check_broadcast_target CHECK (target_group IN ('all', 'premium', 'free', 'gold', 'basic'))
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE broadcasts
      ADD CONSTRAINT check_broadcast_status CHECK (status IN ('sent', 'failed'))
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('broadcasts');
  }
};
