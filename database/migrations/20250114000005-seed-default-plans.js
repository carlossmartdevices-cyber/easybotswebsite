'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const plans = [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        name: 'basic',
        price: 0,
        duration: 30,
        features: JSON.stringify(['Basic features', 'Standard support']),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        name: 'premium',
        price: 9.99,
        duration: 30,
        features: JSON.stringify(['All basic features', 'Priority support', 'Advanced features', 'No ads']),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        name: 'gold',
        price: 19.99,
        duration: 30,
        features: JSON.stringify(['All premium features', '24/7 VIP support', 'Exclusive content', 'Early access to new features']),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('plans', plans, {
      ignoreDuplicates: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('plans', {
      name: ['basic', 'premium', 'gold']
    }, {});
  }
};
