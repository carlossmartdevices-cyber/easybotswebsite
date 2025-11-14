const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Plan Model
 * Represents subscription plans with pricing and features
 */
const Plan = sequelize.define('plans', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Unique plan identifier (UUID)'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Plan name (unique)'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Monthly price'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    },
    comment: 'Duration in days'
  },
  features: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
    comment: 'Array of plan features'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'inactive']]
    },
    comment: 'Plan status'
  },
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'Admin Telegram ID who created the plan'
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
  }
}, {
  tableName: 'plans',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['name'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
});

// Instance methods
Plan.prototype.activate = function() {
  this.status = 'active';
  return this.save();
};

Plan.prototype.deactivate = function() {
  this.status = 'inactive';
  return this.save();
};

Plan.prototype.updatePrice = function(newPrice) {
  this.price = newPrice;
  return this.save();
};

Plan.prototype.addFeature = function(feature) {
  if (!this.features.includes(feature)) {
    this.features = [...this.features, feature];
    return this.save();
  }
  return this;
};

Plan.prototype.removeFeature = function(feature) {
  this.features = this.features.filter(f => f !== feature);
  return this.save();
};

// Class methods
Plan.findActivePlans = function() {
  return this.findAll({
    where: { status: 'active' },
    order: [['price', 'ASC']]
  });
};

Plan.findByName = function(name) {
  const { Op } = require('sequelize');
  return this.findOne({
    where: {
      name: {
        [Op.iLike]: name // Case-insensitive search
      }
    }
  });
};

Plan.getAnalytics = async function() {
  const User = require('./User');
  const plans = await this.findAll({ where: { status: 'active' } });

  const analytics = await Promise.all(plans.map(async (plan) => {
    const userCount = await User.count({
      where: {
        plan: plan.name.toLowerCase(),
        status: 'active'
      }
    });

    const mrr = parseFloat(plan.price) * userCount;
    const arr = mrr * 12;

    return {
      plan: plan.name,
      price: parseFloat(plan.price),
      users: userCount,
      mrr: mrr.toFixed(2),
      arr: arr.toFixed(2),
      features: plan.features
    };
  }));

  return analytics;
};

Plan.getTotalRevenue = async function() {
  const analytics = await this.getAnalytics();
  const totalMRR = analytics.reduce((sum, plan) => sum + parseFloat(plan.mrr), 0);
  const totalARR = analytics.reduce((sum, plan) => sum + parseFloat(plan.arr), 0);

  return {
    mrr: totalMRR.toFixed(2),
    arr: totalARR.toFixed(2)
  };
};

module.exports = Plan;
