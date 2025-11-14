const { AdminLog } = require('../models');
const { Op } = require('sequelize');

/**
 * Admin Log Service
 * Handles admin action logging and audit trail using PostgreSQL
 */
class AdminLogService {
  /**
   * Log an admin action
   */
  static async logAction(adminId, action, target = null, metadata = {}, status = 'success', error = null) {
    return await AdminLog.logAction(adminId, action, target, metadata, status, error);
  }

  /**
   * Get recent logs
   */
  static async getRecentLogs(limit = 50) {
    return await AdminLog.getRecentLogs(limit);
  }

  /**
   * Get logs by admin
   */
  static async getLogsByAdmin(adminId, limit = 50) {
    return await AdminLog.getLogsByAdmin(adminId, limit);
  }

  /**
   * Get logs by action type
   */
  static async getLogsByAction(action, limit = 50) {
    return await AdminLog.getLogsByAction(action, limit);
  }

  /**
   * Get logs by target
   */
  static async getLogsByTarget(target, limit = 50) {
    return await AdminLog.getLogsByTarget(target, limit);
  }

  /**
   * Get logs within date range
   */
  static async getLogsBetween(startDate, endDate, limit = 100) {
    return await AdminLog.findAll({
      where: {
        timestamp: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['timestamp', 'DESC']],
      limit
    });
  }

  /**
   * Get failed actions
   */
  static async getFailedActions(limit = 50) {
    return await AdminLog.findAll({
      where: {
        status: 'failed'
      },
      order: [['timestamp', 'DESC']],
      limit
    });
  }

  /**
   * Get statistics
   */
  static async getStatistics(startDate = null, endDate = null) {
    return await AdminLog.getStatistics(startDate, endDate);
  }

  /**
   * Get admin activity summary
   */
  static async getAdminActivitySummary(adminId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await AdminLog.findAll({
      where: {
        admin_id: adminId,
        timestamp: {
          [Op.gte]: startDate
        }
      },
      order: [['timestamp', 'DESC']]
    });

    const totalActions = logs.length;
    const successfulActions = logs.filter(log => log.status === 'success').length;
    const failedActions = logs.filter(log => log.status === 'failed').length;

    // Count actions by type
    const actionCounts = {};
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    return {
      adminId,
      period: `Last ${days} days`,
      totalActions,
      successfulActions,
      failedActions,
      successRate: totalActions > 0 ? ((successfulActions / totalActions) * 100).toFixed(2) : 0,
      actionBreakdown: actionCounts,
      recentLogs: logs.slice(0, 10)
    };
  }

  /**
   * Get system activity overview
   */
  static async getSystemActivity(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await AdminLog.getStatistics(startDate, null);

    // Get most active admins
    const adminActivity = await AdminLog.findAll({
      where: {
        timestamp: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        'admin_id',
        [AdminLog.sequelize.fn('COUNT', AdminLog.sequelize.col('admin_id')), 'action_count']
      ],
      group: ['admin_id'],
      order: [[AdminLog.sequelize.fn('COUNT', AdminLog.sequelize.col('admin_id')), 'DESC']],
      limit: 10,
      raw: true
    });

    return {
      period: `Last ${days} days`,
      ...stats,
      mostActiveAdmins: adminActivity
    };
  }

  /**
   * Search logs
   */
  static async searchLogs(searchTerm, limit = 50) {
    return await AdminLog.findAll({
      where: {
        [Op.or]: [
          { action: { [Op.iLike]: `%${searchTerm}%` } },
          { target: { [Op.iLike]: `%${searchTerm}%` } },
          { error: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      order: [['timestamp', 'DESC']],
      limit
    });
  }

  /**
   * Export logs to array (for CSV export)
   */
  static async exportLogs(filters = {}, startDate = null, endDate = null) {
    const whereClause = { ...filters };

    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) whereClause.timestamp[Op.gte] = startDate;
      if (endDate) whereClause.timestamp[Op.lte] = endDate;
    }

    const logs = await AdminLog.findAll({
      where: whereClause,
      order: [['timestamp', 'DESC']]
    });

    return logs.map(log => ({
      admin_id: log.admin_id,
      action: log.action,
      target: log.target,
      status: log.status,
      error: log.error,
      timestamp: log.timestamp,
      metadata: JSON.stringify(log.metadata)
    }));
  }

  /**
   * Clear old logs (older than specified days)
   */
  static async clearOldLogs(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await AdminLog.destroy({
      where: {
        timestamp: {
          [Op.lt]: cutoffDate
        }
      }
    });

    return {
      deleted: result,
      cutoffDate
    };
  }
}

module.exports = AdminLogService;
