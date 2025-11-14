const { User } = require('../models');
const { Op } = require('sequelize');

/**
 * User Service
 * Handles all user-related database operations using PostgreSQL
 */
class UserService {
  /**
   * Find user by Telegram ID
   */
  static async findByTelegramId(telegramId) {
    return await User.findByTelegramId(telegramId);
  }

  /**
   * Create or update user
   */
  static async upsert(telegramId, userData) {
    const [user, created] = await User.findOrCreate({
      where: { telegram_id: telegramId },
      defaults: {
        telegram_id: telegramId,
        ...userData,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    if (!created) {
      await user.update(userData);
    }

    return { user, created };
  }

  /**
   * Update user data
   */
  static async update(telegramId, updates) {
    const user = await User.findByTelegramId(telegramId);
    if (!user) {
      throw new Error(`User ${telegramId} not found`);
    }

    return await user.update(updates);
  }

  /**
   * Update user status
   */
  static async updateStatus(telegramId, status) {
    return await this.update(telegramId, { status });
  }

  /**
   * Update user plan
   */
  static async updatePlan(telegramId, plan, subscriptionEnd = null) {
    return await this.update(telegramId, {
      plan: plan.toLowerCase(),
      subscription_end: subscriptionEnd
    });
  }

  /**
   * Extend user subscription
   */
  static async extendSubscription(telegramId, days) {
    const user = await User.findByTelegramId(telegramId);
    if (!user) {
      throw new Error(`User ${telegramId} not found`);
    }

    return await user.extendSubscription(days);
  }

  /**
   * Update last active timestamp
   */
  static async updateLastActive(telegramId) {
    return await this.update(telegramId, {
      last_active: new Date()
    });
  }

  /**
   * Search users by username
   */
  static async searchByUsername(searchTerm) {
    return await User.findAll({
      where: {
        username: {
          [Op.iLike]: `%${searchTerm}%`
        }
      },
      limit: 50
    });
  }

  /**
   * Search users by name
   */
  static async searchByName(searchTerm) {
    return await User.findAll({
      where: {
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${searchTerm}%` } },
          { last_name: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      limit: 50
    });
  }

  /**
   * Get users by plan
   */
  static async getUsersByPlan(plan) {
    return await User.findAll({
      where: {
        plan: plan.toLowerCase(),
        status: 'active'
      }
    });
  }

  /**
   * Get active users
   */
  static async getActiveUsers() {
    return await User.findAll({
      where: { status: 'active' }
    });
  }

  /**
   * Get inactive users
   */
  static async getInactiveUsers() {
    return await User.findAll({
      where: { status: 'inactive' }
    });
  }

  /**
   * Get users with expiring subscriptions
   */
  static async getExpiringSubscriptions(daysThreshold = 7) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return await User.findAll({
      where: {
        status: 'active',
        subscription_end: {
          [Op.and]: [
            { [Op.gte]: new Date() },
            { [Op.lte]: thresholdDate }
          ]
        }
      }
    });
  }

  /**
   * Get user statistics
   */
  static async getStatistics() {
    return await User.getStatistics();
  }

  /**
   * Get users created in date range
   */
  static async getUsersCreatedBetween(startDate, endDate) {
    return await User.findAll({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Get active users in last N days
   */
  static async getActiveUsersInLastDays(days = 7) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - days);

    return await User.findAll({
      where: {
        last_active: {
          [Op.gte]: thresholdDate
        }
      }
    });
  }

  /**
   * Count users by status
   */
  static async countByStatus() {
    const active = await User.count({ where: { status: 'active' } });
    const inactive = await User.count({ where: { status: 'inactive' } });

    return { active, inactive, total: active + inactive };
  }

  /**
   * Count users by plan
   */
  static async countByPlan() {
    const plans = ['basic', 'premium', 'gold'];
    const counts = {};

    for (const plan of plans) {
      counts[plan] = await User.count({
        where: { plan, status: 'active' }
      });
    }

    return counts;
  }

  /**
   * Get new users today
   */
  static async getNewUsersToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await User.findAll({
      where: {
        created_at: {
          [Op.gte]: today
        }
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Export users to array (for CSV export)
   */
  static async exportUsers(filters = {}) {
    const users = await User.findAll({
      where: filters,
      order: [['created_at', 'DESC']]
    });

    return users.map(user => ({
      telegram_id: user.telegram_id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      plan: user.plan,
      status: user.status,
      subscription_end: user.subscription_end,
      created_at: user.created_at,
      last_active: user.last_active
    }));
  }

  /**
   * Delete user (soft delete by setting status to inactive)
   */
  static async deleteUser(telegramId) {
    return await this.updateStatus(telegramId, 'inactive');
  }

  /**
   * Restore user
   */
  static async restoreUser(telegramId) {
    return await this.updateStatus(telegramId, 'active');
  }
}

module.exports = UserService;
