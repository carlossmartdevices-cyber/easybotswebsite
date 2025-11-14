require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'pnptv',
    password: process.env.DB_PASSWORD || 'changeme',
    database: process.env.DB_NAME || 'pnptv_dev',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    username: process.env.DB_USER || 'pnptv',
    password: process.env.DB_PASSWORD || 'changeme',
    database: process.env.DB_NAME_TEST || 'pnptv_test',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'pnptv_prod',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    }
  }
};
