/**
 * Admin inline menu templates
 */

/**
 * Main admin dashboard menu
 */
function getAdminDashboardMenu() {
  return {
    inline_keyboard: [
      [{ text: '📢 Broadcast Messages', callback_data: 'admin_broadcast' }],
      [{ text: '👥 User Management', callback_data: 'admin_users' }],
      [{ text: '📊 Analytics', callback_data: 'admin_analytics' }],
      [{ text: '💰 Plan Management', callback_data: 'admin_plans' }],
      [{ text: '📋 View Logs', callback_data: 'admin_logs' }],
      [{ text: '🔙 Close', callback_data: 'admin_close' }]
    ]
  };
}

/**
 * Broadcast menu
 */
function getBroadcastMenu() {
  return {
    inline_keyboard: [
      [{ text: '💬 Text Message', callback_data: 'broadcast_text' }],
      [{ text: '📷 Photo with Caption', callback_data: 'broadcast_photo' }],
      [{ text: '🎥 Video with Caption', callback_data: 'broadcast_video' }],
      [{ text: '🔙 Back to Dashboard', callback_data: 'admin_dashboard' }]
    ]
  };
}

/**
 * Broadcast confirmation menu
 * @param {string} broadcastType - Type of broadcast
 */
function getBroadcastConfirmMenu(broadcastType) {
  return {
    inline_keyboard: [
      [
        { text: '✅ Send to All Users', callback_data: `broadcast_send_all_${broadcastType}` }
      ],
      [
        { text: '👑 Send to Premium Only', callback_data: `broadcast_send_premium_${broadcastType}` }
      ],
      [
        { text: '🆓 Send to Free Only', callback_data: `broadcast_send_free_${broadcastType}` }
      ],
      [
        { text: '❌ Cancel', callback_data: 'admin_broadcast' }
      ]
    ]
  };
}

/**
 * User management menu
 */
function getUserManagementMenu() {
  return {
    inline_keyboard: [
      [{ text: '🔍 Search User', callback_data: 'admin_search_user' }],
      [{ text: '📊 User Statistics', callback_data: 'admin_user_stats' }],
      [{ text: '📤 Export Users', callback_data: 'admin_export_users' }],
      [{ text: '🔙 Back to Dashboard', callback_data: 'admin_dashboard' }]
    ]
  };
}

/**
 * User actions menu
 * @param {string} userId - User ID
 */
function getUserActionsMenu(userId) {
  return {
    inline_keyboard: [
      [{ text: '✏️ Edit User Data', callback_data: `admin_edit_user_${userId}` }],
      [{ text: '🔄 Extend Subscription', callback_data: `admin_extend_sub_${userId}` }],
      [{ text: '💰 Change Plan', callback_data: `admin_change_plan_${userId}` }],
      [
        { text: '🟢 Activate', callback_data: `admin_activate_${userId}` },
        { text: '🔴 Deactivate', callback_data: `admin_deactivate_${userId}` }
      ],
      [{ text: '🔙 Back', callback_data: 'admin_users' }]
    ]
  };
}

/**
 * Analytics menu
 */
function getAnalyticsMenu() {
  return {
    inline_keyboard: [
      [{ text: '📈 User Growth', callback_data: 'analytics_users' }],
      [{ text: '💰 Revenue', callback_data: 'analytics_revenue' }],
      [{ text: '💬 Engagement', callback_data: 'analytics_engagement' }],
      [{ text: '📊 Plans Overview', callback_data: 'analytics_plans' }],
      [{ text: '📄 Export Data', callback_data: 'analytics_export' }],
      [{ text: '🔙 Back to Dashboard', callback_data: 'admin_dashboard' }]
    ]
  };
}

/**
 * Plan management menu
 */
function getPlanManagementMenu() {
  return {
    inline_keyboard: [
      [{ text: '➕ Add New Plan', callback_data: 'plan_add' }],
      [{ text: '📋 View All Plans', callback_data: 'plan_view_all' }],
      [{ text: '✏️ Edit Plan', callback_data: 'plan_edit' }],
      [{ text: '📊 Plan Analytics', callback_data: 'plan_analytics' }],
      [{ text: '🔙 Back to Dashboard', callback_data: 'admin_dashboard' }]
    ]
  };
}

/**
 * Plan actions menu
 * @param {string} planId - Plan ID
 */
function getPlanActionsMenu(planId) {
  return {
    inline_keyboard: [
      [{ text: '✏️ Edit Details', callback_data: `plan_edit_${planId}` }],
      [
        { text: '✅ Activate', callback_data: `plan_activate_${planId}` },
        { text: '❌ Deactivate', callback_data: `plan_deactivate_${planId}` }
      ],
      [{ text: '📊 View Analytics', callback_data: `plan_view_analytics_${planId}` }],
      [{ text: '🔙 Back', callback_data: 'admin_plans' }]
    ]
  };
}

/**
 * Logs filter menu
 */
function getLogsMenu() {
  return {
    inline_keyboard: [
      [{ text: '📊 All Logs', callback_data: 'logs_all' }],
      [{ text: '📢 Broadcast Logs', callback_data: 'logs_broadcast' }],
      [{ text: '👥 User Management Logs', callback_data: 'logs_users' }],
      [{ text: '💰 Plan Logs', callback_data: 'logs_plans' }],
      [{ text: '🔙 Back to Dashboard', callback_data: 'admin_dashboard' }]
    ]
  };
}

module.exports = {
  getAdminDashboardMenu,
  getBroadcastMenu,
  getBroadcastConfirmMenu,
  getUserManagementMenu,
  getUserActionsMenu,
  getAnalyticsMenu,
  getPlanManagementMenu,
  getPlanActionsMenu,
  getLogsMenu
};
