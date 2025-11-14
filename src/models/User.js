const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * User Model
 * Represents Telegram bot users with subscription and profile information
 */
const User = sequelize.define('users', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Unique user identifier (UUID)'
  },
  telegram_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
    comment: 'Telegram user ID (unique)'
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Telegram username'
  },
  first_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'User\'s first name'
  },
  last_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'User\'s last name'
  },
  plan: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'basic',
    validate: {
      isIn: [['basic', 'premium', 'gold']]
    },
    comment: 'Current subscription plan'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'inactive']]
    },
    comment: 'User account status'
  },
  subscription_end: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Subscription end date/time'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User biography'
  },
  location_city: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'User\'s city'
  },
  location_latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    comment: 'Location latitude'
  },
  location_longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    comment: 'Location longitude'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  },
  last_active: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last activity timestamp'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['telegram_id'] },
    { fields: ['username'] },
    { fields: ['plan'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
    { fields: ['last_active'] },
    { fields: ['subscription_end'] }
  ]
});

// Instance methods
User.prototype.isSubscriptionActive = function() {
  if (!this.subscription_end) return true; // No expiry means lifetime or basic
  return new Date(this.subscription_end) > new Date();
};

User.prototype.getDaysUntilExpiry = function() {
  if (!this.subscription_end) return null;
  const now = new Date();
  const end = new Date(this.subscription_end);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

User.prototype.extendSubscription = function(days) {
  const currentEnd = this.subscription_end ? new Date(this.subscription_end) : new Date();
  const newEnd = new Date(currentEnd.getTime() + (days * 24 * 60 * 60 * 1000));
  this.subscription_end = newEnd;
  return this.save();
};

// Class methods
User.findByTelegramId = function(telegramId) {
  return this.findOne({ where: { telegram_id: telegramId } });
};

User.findActiveUsers = function() {
  return this.findAll({ where: { status: 'active' } });
};

User.findByPlan = function(plan) {
  return this.findAll({ where: { plan, status: 'active' } });
};

User.searchByUsername = function(searchTerm) {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      username: {
        [Op.iLike]: `%${searchTerm}%`
      }
    }
  });
};

User.searchByName = function(searchTerm) {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      [Op.or]: [
        { first_name: { [Op.iLike]: `%${searchTerm}%` } },
        { last_name: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    }
  });
};

User.getStatistics = async function() {
  const { Op } = require('sequelize');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [total, active, premium, gold, newToday, active7d] = await Promise.all([
    this.count(),
    this.count({ where: { status: 'active' } }),
    this.count({ where: { plan: 'premium', status: 'active' } }),
    this.count({ where: { plan: 'gold', status: 'active' } }),
    this.count({ where: { created_at: { [Op.gte]: today } } }),
    this.count({ where: { last_active: { [Op.gte]: new Date(now - 7 * 24 * 60 * 60 * 1000) } } })
  ]);

  return { total, active, premium, gold, newToday, active7d };
};

module.exports = User;
