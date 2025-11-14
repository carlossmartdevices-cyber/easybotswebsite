const { Sequelize } = require('sequelize');
require('dotenv').config();

const config = require('../../database/config')[process.env.NODE_ENV || 'development'];

// Create Sequelize instance
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  dialectOptions: config.dialectOptions,
  logging: config.logging,
  pool: config.pool,
  define: {
    timestamps: true,
    underscored: true, // Use snake_case for column names
    freezeTableName: true // Prevent Sequelize from pluralizing table names
  }
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL:', error.message);
    process.exit(1);
  }
};

// Initialize database connection
testConnection();

module.exports = sequelize;
