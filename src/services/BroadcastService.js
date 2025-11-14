const { Broadcast, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Broadcast Service
 * Handles broadcast message tracking using PostgreSQL
 */
class BroadcastService {
  /**
   * Log a broadcast delivery
   */
  static async logBroadcast(adminId, userId, type, targetGroup, message = null, fileId = null, status = 'sent', error = null) {
    return await Broadcast.logBroadcast(adminId, userId, type, targetGroup, message, fileId, status, error);
  }

  /**
   * Get recent broadcasts
   */
  static async getRecentBroadcasts(limit = 100) {
    return await Broadcast.getRecentBroadcasts(limit);
  }

  /**
   * Get broadcasts by admin
   */
  static async getBroadcastsByAdmin(adminId, limit = 100) {
    return await Broadcast.getBroadcastsByAdmin(adminId, limit);
  }

  /**
   * Get broadcasts by user
   */
  static async getBroadcastsByUser(userId, limit = 50) {
    return await Broadcast.getBroadcastsByUser(userId, limit);
  }

  /**
   * Get broadcasts within date range
   */
  static async getBroadcastsBetween(startDate, endDate, limit = 200) {
    return await Broadcast.findAll({
      where: {
        sent_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['sent_at', 'DESC']],
      limit
    });
  }

  /**
   * Get broadcast statistics
   */
  static async getStatistics(startDate = null, endDate = null) {
    return await Broadcast.getStatistics(startDate, endDate);
  }

  /**
   * Get delivery rate
   */
  static async getDeliveryRate(targetGroup = null, startDate = null, endDate = null) {
    return await Broadcast.getDeliveryRate(targetGroup, startDate, endDate);
  }

  /**
   * Get broadcasts by target group
   */
  static async getBroadcastsByTargetGroup(targetGroup, limit = 100) {
    return await Broadcast.findAll({
      where: { target_group: targetGroup },
      order: [['sent_at', 'DESC']],
      limit
    });
  }

  /**
   * Get broadcasts by type
   */
  static async getBroadcastsByType(type, limit = 100) {
    return await Broadcast.findAll({
      where: { type },
      order: [['sent_at', 'DESC']],
      limit
    });
  }

  /**
   * Get failed broadcasts
   */
  static async getFailedBroadcasts(limit = 50) {
    return await Broadcast.findAll({
      where: { status: 'failed' },
      order: [['sent_at', 'DESC']],
      limit
    });
  }

  /**
   * Get broadcast campaign summary
   */
  static async getCampaignSummary(adminId, startDate, endDate) {
    const broadcasts = await Broadcast.findAll({
      where: {
        admin_id: adminId,
        sent_at: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    const total = broadcasts.length;
    const sent = broadcasts.filter(b => b.status === 'sent').length;
    const failed = broadcasts.filter(b => b.status === 'failed').length;

    const byTargetGroup = {};
    const byType = {};

    broadcasts.forEach(broadcast => {
      byTargetGroup[broadcast.target_group] = (byTargetGroup[broadcast.target_group] || 0) + 1;
      byType[broadcast.type] = (byType[broadcast.type] || 0) + 1;
    });

    return {
      adminId,
      period: { startDate, endDate },
      total,
      sent,
      failed,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : 0,
      byTargetGroup,
      byType
    };
  }

  /**
   * Get user engagement (broadcasts received vs. active)
   */
  static async getUserEngagement(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const receivedBroadcasts = await Broadcast.count({
      where: {
        user_id: userId,
        sent_at: {
          [Op.gte]: startDate
        }
      }
    });

    const successfulDeliveries = await Broadcast.count({
      where: {
        user_id: userId,
        status: 'sent',
        sent_at: {
          [Op.gte]: startDate
        }
      }
    });

    return {
      userId,
      period: `Last ${days} days`,
      totalBroadcasts: receivedBroadcasts,
      successfulDeliveries,
      failedDeliveries: receivedBroadcasts - successfulDeliveries
    };
  }

  /**
   * Export broadcasts to array (for CSV export)
   */
  static async exportBroadcasts(filters = {}, startDate = null, endDate = null) {
    const whereClause = { ...filters };

    if (startDate || endDate) {
      whereClause.sent_at = {};
      if (startDate) whereClause.sent_at[Op.gte] = startDate;
      if (endDate) whereClause.sent_at[Op.lte] = endDate;
    }

    const broadcasts = await Broadcast.findAll({
      where: whereClause,
      order: [['sent_at', 'DESC']]
    });

    return broadcasts.map(broadcast => ({
      admin_id: broadcast.admin_id,
      user_id: broadcast.user_id,
      type: broadcast.type,
      target_group: broadcast.target_group,
      message: broadcast.message,
      status: broadcast.status,
      error: broadcast.error,
      sent_at: broadcast.sent_at
    }));
  }

  /**
   * Clear old broadcasts (older than specified days)
   */
  static async clearOldBroadcasts(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await Broadcast.destroy({
      where: {
        sent_at: {
          [Op.lt]: cutoffDate
        }
      }
    });

    return {
      deleted: result,
      cutoffDate
    };
  }

  /**
   * Get target users for broadcast
   */
  static async getTargetUsers(targetGroup) {
    let whereClause = { status: 'active' };

    if (targetGroup === 'premium') {
      whereClause.plan = 'premium';
    } else if (targetGroup === 'gold') {
      whereClause.plan = 'gold';
    } else if (targetGroup === 'free' || targetGroup === 'basic') {
      whereClause.plan = 'basic';
    }
    // 'all' = no additional filter, just active status

    return await User.findAll({
      where: whereClause,
      attributes: ['telegram_id', 'username', 'first_name', 'plan']
    });
  }
}

module.exports = BroadcastService;
