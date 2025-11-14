'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('plans', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      features: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: '[]'
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'active'
      },
      created_by: {
        type: Sequelize.BIGINT,
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
      }
    });

    // Add indexes
    await queryInterface.addIndex('plans', ['name']);
    await queryInterface.addIndex('plans', ['status']);
    await queryInterface.addIndex('plans', ['created_at']);

    // Add check constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE plans
      ADD CONSTRAINT check_plan_status CHECK (status IN ('active', 'inactive'))
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE plans
      ADD CONSTRAINT check_price CHECK (price >= 0)
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE plans
      ADD CONSTRAINT check_duration CHECK (duration > 0)
    `);

    // Add trigger for updated_at
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_plans_updated_at
      BEFORE UPDATE ON plans
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;');
    await queryInterface.dropTable('plans');
  }
};
