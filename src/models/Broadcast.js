const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Broadcast Model
 * Tracks broadcast messages sent to users
 */
const Broadcast = sequelize.define('broadcasts', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Unique broadcast identifier (UUID)'
  },
  admin_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: 'Admin Telegram ID who sent the broadcast'
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: 'Recipient Telegram ID'
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['text', 'photo', 'video']]
    },
    comment: 'Message type'
  },
  target_group: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['all', 'premium', 'free', 'gold', 'basic']]
    },
    comment: 'Target user group'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Message text or caption'
  },
  file_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Telegram file ID for media'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'sent',
    validate: {
      isIn: [['sent', 'failed']]
    },
    comment: 'Delivery status'
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if failed'
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When the broadcast was sent'
  }
}, {
  tableName: 'broadcasts',
  timestamps: false, // We use custom sent_at field
  underscored: true,
  indexes: [
    { fields: ['admin_id'] },
    { fields: ['user_id'] },
    { fields: ['sent_at'] },
    { fields: ['status'] },
    { fields: ['target_group'] }
  ]
});

// Class methods
Broadcast.logBroadcast = async function(adminId, userId, type, targetGroup, message = null, fileId = null, status = 'sent', error = null) {
  return this.create({
    admin_id: adminId,
    user_id: userId,
    type,
    target_group: targetGroup,
    message,
    file_id: fileId,
    status,
    error
  });
};

Broadcast.getRecentBroadcasts = function(limit = 100) {
  return this.findAll({
    order: [['sent_at', 'DESC']],
    limit
  });
};

Broadcast.getBroadcastsByAdmin = function(adminId, limit = 100) {
  return this.findAll({
    where: { admin_id: adminId },
    order: [['sent_at', 'DESC']],
    limit
  });
};

Broadcast.getBroadcastsByUser = function(userId, limit = 50) {
  return this.findAll({
    where: { user_id: userId },
    order: [['sent_at', 'DESC']],
    limit
  });
};

Broadcast.getStatistics = async function(startDate = null, endDate = null) {
  const { Op } = require('sequelize');

  const whereClause = {};
  if (startDate || endDate) {
    whereClause.sent_at = {};
    if (startDate) whereClause.sent_at[Op.gte] = startDate;
    if (endDate) whereClause.sent_at[Op.lte] = endDate;
  }

  const [total, sent, failed] = await Promise.all([
    this.count({ where: whereClause }),
    this.count({ where: { ...whereClause, status: 'sent' } }),
    this.count({ where: { ...whereClause, status: 'failed' } })
  ]);

  const byTargetGroup = await this.findAll({
    where: whereClause,
    attributes: [
      'target_group',
      [sequelize.fn('COUNT', sequelize.col('target_group')), 'count'],
      [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'sent' THEN 1 END")), 'successful']
    ],
    group: ['target_group'],
    raw: true
  });

  const byType = await this.findAll({
    where: whereClause,
    attributes: [
      'type',
      [sequelize.fn('COUNT', sequelize.col('type')), 'count']
    ],
    group: ['type'],
    raw: true
  });

  return {
    total,
    sent,
    failed,
    successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : 0,
    byTargetGroup,
    byType
  };
};

Broadcast.getDeliveryRate = async function(targetGroup = null, startDate = null, endDate = null) {
  const { Op } = require('sequelize');

  const whereClause = {};
  if (targetGroup) whereClause.target_group = targetGroup;
  if (startDate || endDate) {
    whereClause.sent_at = {};
    if (startDate) whereClause.sent_at[Op.gte] = startDate;
    if (endDate) whereClause.sent_at[Op.lte] = endDate;
  }

  const [total, sent] = await Promise.all([
    this.count({ where: whereClause }),
    this.count({ where: { ...whereClause, status: 'sent' } })
  ]);

  return {
    total,
    sent,
    failed: total - sent,
    rate: total > 0 ? ((sent / total) * 100).toFixed(2) : 0
  };
};

module.exports = Broadcast;
