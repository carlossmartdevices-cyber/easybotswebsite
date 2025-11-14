const { Plan, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Plan Service
 * Handles all plan-related database operations using PostgreSQL
 */
class PlanService {
  /**
   * Get all plans
   */
  static async getAllPlans() {
    return await Plan.findAll({
      order: [['price', 'ASC']]
    });
  }

  /**
   * Get active plans only
   */
  static async getActivePlans() {
    return await Plan.findActivePlans();
  }

  /**
   * Find plan by name (case-insensitive)
   */
  static async findByName(name) {
    return await Plan.findByName(name);
  }

  /**
   * Find plan by ID
   */
  static async findById(id) {
    return await Plan.findByPk(id);
  }

  /**
   * Create new plan
   */
  static async createPlan(planData, adminId = null) {
    return await Plan.create({
      ...planData,
      created_by: adminId,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Update plan
   */
  static async updatePlan(planId, updates) {
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    return await plan.update(updates);
  }

  /**
   * Update plan by name
   */
  static async updatePlanByName(name, updates) {
    const plan = await Plan.findByName(name);
    if (!plan) {
      throw new Error(`Plan ${name} not found`);
    }

    return await plan.update(updates);
  }

  /**
   * Activate plan
   */
  static async activatePlan(planId) {
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    return await plan.activate();
  }

  /**
   * Deactivate plan
   */
  static async deactivatePlan(planId) {
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    return await plan.deactivate();
  }

  /**
   * Update plan price
   */
  static async updatePrice(planId, newPrice) {
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    return await plan.updatePrice(newPrice);
  }

  /**
   * Add feature to plan
   */
  static async addFeature(planId, feature) {
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    return await plan.addFeature(feature);
  }

  /**
   * Remove feature from plan
   */
  static async removeFeature(planId, feature) {
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    return await plan.removeFeature(feature);
  }

  /**
   * Get plan analytics
   */
  static async getAnalytics() {
    return await Plan.getAnalytics();
  }

  /**
   * Get total revenue (MRR and ARR)
   */
  static async getTotalRevenue() {
    return await Plan.getTotalRevenue();
  }

  /**
   * Get user count for specific plan
   */
  static async getUserCount(planName) {
    return await User.count({
      where: {
        plan: planName.toLowerCase(),
        status: 'active'
      }
    });
  }

  /**
   * Get users for specific plan
   */
  static async getUsersForPlan(planName) {
    return await User.findAll({
      where: {
        plan: planName.toLowerCase(),
        status: 'active'
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Calculate plan revenue
   */
  static async calculatePlanRevenue(planName) {
    const plan = await Plan.findByName(planName);
    if (!plan) {
      throw new Error(`Plan ${planName} not found`);
    }

    const userCount = await this.getUserCount(planName);
    const mrr = parseFloat(plan.price) * userCount;
    const arr = mrr * 12;

    return {
      plan: plan.name,
      price: parseFloat(plan.price),
      users: userCount,
      mrr: mrr.toFixed(2),
      arr: arr.toFixed(2)
    };
  }

  /**
   * Get plan distribution (percentage of users per plan)
   */
  static async getPlanDistribution() {
    const totalUsers = await User.count({ where: { status: 'active' } });
    const plans = await Plan.findActivePlans();

    const distribution = await Promise.all(plans.map(async (plan) => {
      const userCount = await this.getUserCount(plan.name);
      const percentage = totalUsers > 0 ? ((userCount / totalUsers) * 100).toFixed(2) : 0;

      return {
        plan: plan.name,
        users: userCount,
        percentage: parseFloat(percentage)
      };
    }));

    return distribution;
  }

  /**
   * Delete plan (soft delete by setting status to inactive)
   */
  static async deletePlan(planId) {
    return await this.deactivatePlan(planId);
  }
}

module.exports = PlanService;
