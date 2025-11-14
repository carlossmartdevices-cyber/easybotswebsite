const sequelize = require('../config/database');
const User = require('./User');
const Plan = require('./Plan');
const AdminLog = require('./AdminLog');
const Broadcast = require('./Broadcast');

// Define relationships (if needed in the future)
// User.hasMany(Broadcast, { foreignKey: 'user_id', sourceKey: 'telegram_id' });
// Broadcast.belongsTo(User, { foreignKey: 'user_id', targetKey: 'telegram_id' });

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  Plan,
  AdminLog,
  Broadcast
};
