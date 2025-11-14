const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * AdminLog Model
 * Tracks administrative actions for audit trail
 */
const AdminLog = sequelize.define('admin_logs', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Unique log identifier (UUID)'
  },
  admin_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: 'Admin Telegram ID'
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Action performed'
  },
  target: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Target of the action (user ID, plan ID, etc.)'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional context about the action'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'success',
    validate: {
      isIn: [['success', 'failed', 'partial']]
    },
    comment: 'Action result status'
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if failed'
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When the action occurred'
  }
}, {
  tableName: 'admin_logs',
  timestamps: false, // We use custom timestamp field
  underscored: true,
  indexes: [
    { fields: ['admin_id'] },
    { fields: ['action'] },
    { fields: ['timestamp'] },
    { fields: ['target'] }
  ]
});

// Class methods
AdminLog.logAction = async function(adminId, action, target = null, metadata = {}, status = 'success', error = null) {
  return this.create({
    admin_id: adminId,
    action,
    target,
    metadata,
    status,
    error
  });
};

AdminLog.getRecentLogs = function(limit = 50) {
  return this.findAll({
    order: [['timestamp', 'DESC']],
    limit
  });
};

AdminLog.getLogsByAdmin = function(adminId, limit = 50) {
  return this.findAll({
    where: { admin_id: adminId },
    order: [['timestamp', 'DESC']],
    limit
  });
};

AdminLog.getLogsByAction = function(action, limit = 50) {
  return this.findAll({
    where: { action },
    order: [['timestamp', 'DESC']],
    limit
  });
};

AdminLog.getLogsByTarget = function(target, limit = 50) {
  return this.findAll({
    where: { target },
    order: [['timestamp', 'DESC']],
    limit
  });
};

AdminLog.getStatistics = async function(startDate = null, endDate = null) {
  const { Op } = require('sequelize');

  const whereClause = {};
  if (startDate || endDate) {
    whereClause.timestamp = {};
    if (startDate) whereClause.timestamp[Op.gte] = startDate;
    if (endDate) whereClause.timestamp[Op.lte] = endDate;
  }

  const [total, successful, failed] = await Promise.all([
    this.count({ where: whereClause }),
    this.count({ where: { ...whereClause, status: 'success' } }),
    this.count({ where: { ...whereClause, status: 'failed' } })
  ]);

  const topActions = await this.findAll({
    where: whereClause,
    attributes: [
      'action',
      [sequelize.fn('COUNT', sequelize.col('action')), 'count']
    ],
    group: ['action'],
    order: [[sequelize.fn('COUNT', sequelize.col('action')), 'DESC']],
    limit: 10,
    raw: true
  });

  return {
    total,
    successful,
    failed,
    successRate: total > 0 ? ((successful / total) * 100).toFixed(2) : 0,
    topActions
  };
};

module.exports = AdminLog;
