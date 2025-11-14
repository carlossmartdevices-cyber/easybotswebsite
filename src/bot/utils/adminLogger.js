/**
 * Admin action logging utility
 * Logs all admin actions to Firestore and console
 */

const { db } = require('../../config/firebase');

/**
 * Log admin action to Firestore
 * @param {Object} params - Log parameters
 * @param {number} params.adminId - Admin user ID
 * @param {string} params.action - Action performed
 * @param {string} params.target - Target of action (e.g., 'all_users', 'user_123')
 * @param {Object} params.metadata - Additional metadata
 * @param {string} params.status - Action status ('success', 'failed', 'partial')
 * @param {string} params.error - Error message if failed
 */
async function logAdminAction({ adminId, action, target, metadata = {}, status = 'success', error = null }) {
  try {
    const logEntry = {
      adminId,
      action,
      target,
      metadata,
      status,
      error,
      timestamp: new Date()
    };

    // Log to console
    console.log(`[ADMIN] ${adminId} - ${action} - ${target} - ${status}`);

    // Log to Firestore if available
    if (db) {
      await db.collection('admin_logs').add(logEntry);
    }

    return true;
  } catch (err) {
    console.error('Failed to log admin action:', err);
    return false;
  }
}

/**
 * Get admin action logs
 * @param {Object} filters - Filter parameters
 * @param {number} filters.adminId - Filter by admin ID
 * @param {string} filters.action - Filter by action type
 * @param {number} filters.limit - Number of logs to retrieve
 * @returns {Array} - Array of log entries
 */
async function getAdminLogs({ adminId = null, action = null, limit = 50 } = {}) {
  try {
    if (!db) {
      console.warn('Firestore not available - cannot retrieve logs');
      return [];
    }

    let query = db.collection('admin_logs')
      .orderBy('timestamp', 'desc')
      .limit(limit);

    if (adminId) {
      query = query.where('adminId', '==', adminId);
    }

    if (action) {
      query = query.where('action', '==', action);
    }

    const snapshot = await query.get();
    const logs = [];

    snapshot.forEach(doc => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return logs;
  } catch (error) {
    console.error('Failed to get admin logs:', error);
    return [];
  }
}

/**
 * Format log entry for display
 * @param {Object} log - Log entry
 * @returns {string} - Formatted log string
 */
function formatLog(log) {
  const timestamp = log.timestamp?.toDate?.() || new Date(log.timestamp);
  const date = timestamp.toLocaleString();
  const status = log.status === 'success' ? '✅' : log.status === 'failed' ? '❌' : '⚠️';

  return `${status} ${date}\n` +
    `Action: ${log.action}\n` +
    `Target: ${log.target}\n` +
    `Status: ${log.status}` +
    (log.error ? `\nError: ${log.error}` : '');
}

module.exports = {
  logAdminAction,
  getAdminLogs,
  formatLog
};
