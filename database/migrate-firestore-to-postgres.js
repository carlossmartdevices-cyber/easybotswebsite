#!/usr/bin/env node

/**
 * Firestore to PostgreSQL Data Migration Script
 *
 * This script migrates all data from Firestore to PostgreSQL
 *
 * Usage:
 *   node database/migrate-firestore-to-postgres.js [options]
 *
 * Options:
 *   --dry-run        Run without actually inserting data (for testing)
 *   --collection     Migrate only specific collection (users|plans|admin_logs|broadcasts)
 *   --batch-size     Number of records to process at once (default: 100)
 *   --skip-existing  Skip records that already exist in PostgreSQL
 *
 * Environment:
 *   Requires both Firebase and PostgreSQL credentials in .env
 */

require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { User, Plan, AdminLog, Broadcast, sequelize } = require('../src/models');

// Configuration
const BATCH_SIZE = parseInt(process.argv.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '100');
const DRY_RUN = process.argv.includes('--dry-run');
const SKIP_EXISTING = process.argv.includes('--skip-existing');
const SPECIFIC_COLLECTION = process.argv.find(arg => arg.startsWith('--collection='))?.split('=')[1];

// Statistics
const stats = {
  users: { total: 0, migrated: 0, skipped: 0, errors: 0 },
  plans: { total: 0, migrated: 0, skipped: 0, errors: 0 },
  admin_logs: { total: 0, migrated: 0, skipped: 0, errors: 0 },
  broadcasts: { total: 0, migrated: 0, skipped: 0, errors: 0 }
};

// Initialize Firebase
let db;
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
  db = getFirestore();
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error.message);
  process.exit(1);
}

/**
 * Convert Firestore Timestamp to JavaScript Date
 */
function convertTimestamp(timestamp) {
  if (!timestamp) return null;
  if (timestamp._seconds !== undefined) {
    return new Date(timestamp._seconds * 1000);
  }
  if (timestamp.toDate) {
    return timestamp.toDate();
  }
  return timestamp;
}

/**
 * Migrate Users Collection
 */
async function migrateUsers() {
  console.log('\n📊 Migrating Users...');

  try {
    const snapshot = await db.collection('users').get();
    stats.users.total = snapshot.size;
    console.log(`Found ${snapshot.size} users in Firestore`);

    if (snapshot.empty) {
      console.log('No users to migrate');
      return;
    }

    const batches = [];
    let batch = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const user = {
        telegram_id: parseInt(data.id || doc.id),
        username: data.username || null,
        first_name: data.firstName || null,
        last_name: data.lastName || null,
        plan: (data.plan || 'basic').toLowerCase(),
        status: data.status || 'active',
        subscription_end: convertTimestamp(data.subscriptionEnd),
        bio: data.bio || null,
        location_city: data.location?.city || null,
        location_latitude: data.location?.latitude || null,
        location_longitude: data.location?.longitude || null,
        created_at: convertTimestamp(data.createdAt) || new Date(),
        updated_at: convertTimestamp(data.updatedAt) || new Date(),
        last_active: convertTimestamp(data.lastActive) || null
      };

      batch.push(user);

      if (batch.length >= BATCH_SIZE) {
        batches.push([...batch]);
        batch = [];
      }
    }

    if (batch.length > 0) {
      batches.push(batch);
    }

    // Process batches
    for (let i = 0; i < batches.length; i++) {
      const currentBatch = batches[i];
      console.log(`Processing batch ${i + 1}/${batches.length} (${currentBatch.length} users)...`);

      if (DRY_RUN) {
        console.log('DRY RUN: Would insert:', currentBatch[0]);
        stats.users.migrated += currentBatch.length;
        continue;
      }

      try {
        if (SKIP_EXISTING) {
          // Insert individually and skip duplicates
          for (const user of currentBatch) {
            try {
              await User.create(user);
              stats.users.migrated++;
            } catch (error) {
              if (error.name === 'SequelizeUniqueConstraintError') {
                stats.users.skipped++;
              } else {
                console.error(`Error inserting user ${user.telegram_id}:`, error.message);
                stats.users.errors++;
              }
            }
          }
        } else {
          // Bulk insert
          await User.bulkCreate(currentBatch, { validate: true });
          stats.users.migrated += currentBatch.length;
        }
      } catch (error) {
        console.error(`Error in batch ${i + 1}:`, error.message);
        stats.users.errors += currentBatch.length;
      }
    }

    console.log(`✅ Users migration completed: ${stats.users.migrated} migrated, ${stats.users.skipped} skipped, ${stats.users.errors} errors`);
  } catch (error) {
    console.error('❌ Error migrating users:', error.message);
    throw error;
  }
}

/**
 * Migrate Plans Collection
 */
async function migratePlans() {
  console.log('\n📊 Migrating Plans...');

  try {
    const snapshot = await db.collection('plans').get();
    stats.plans.total = snapshot.size;
    console.log(`Found ${snapshot.size} plans in Firestore`);

    if (snapshot.empty) {
      console.log('No plans to migrate');
      return;
    }

    const plans = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const plan = {
        name: data.name,
        price: parseFloat(data.price) || 0,
        duration: parseInt(data.duration) || 30,
        features: Array.isArray(data.features) ? data.features : [],
        status: data.status || 'active',
        created_by: data.createdBy ? parseInt(data.createdBy) : null,
        created_at: convertTimestamp(data.createdAt) || new Date(),
        updated_at: convertTimestamp(data.updatedAt) || new Date()
      };

      plans.push(plan);
    }

    if (DRY_RUN) {
      console.log('DRY RUN: Would insert:', plans[0]);
      stats.plans.migrated += plans.length;
    } else {
      try {
        if (SKIP_EXISTING) {
          for (const plan of plans) {
            try {
              await Plan.create(plan);
              stats.plans.migrated++;
            } catch (error) {
              if (error.name === 'SequelizeUniqueConstraintError') {
                stats.plans.skipped++;
              } else {
                console.error(`Error inserting plan ${plan.name}:`, error.message);
                stats.plans.errors++;
              }
            }
          }
        } else {
          await Plan.bulkCreate(plans, { validate: true });
          stats.plans.migrated += plans.length;
        }
      } catch (error) {
        console.error('Error inserting plans:', error.message);
        stats.plans.errors += plans.length;
      }
    }

    console.log(`✅ Plans migration completed: ${stats.plans.migrated} migrated, ${stats.plans.skipped} skipped, ${stats.plans.errors} errors`);
  } catch (error) {
    console.error('❌ Error migrating plans:', error.message);
    throw error;
  }
}

/**
 * Migrate Admin Logs Collection
 */
async function migrateAdminLogs() {
  console.log('\n📊 Migrating Admin Logs...');

  try {
    const snapshot = await db.collection('admin_logs').get();
    stats.admin_logs.total = snapshot.size;
    console.log(`Found ${snapshot.size} admin logs in Firestore`);

    if (snapshot.empty) {
      console.log('No admin logs to migrate');
      return;
    }

    const batches = [];
    let batch = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const log = {
        admin_id: parseInt(data.adminId),
        action: data.action,
        target: data.target || null,
        metadata: data.metadata || {},
        status: data.status || 'success',
        error: data.error || null,
        timestamp: convertTimestamp(data.timestamp) || new Date()
      };

      batch.push(log);

      if (batch.length >= BATCH_SIZE) {
        batches.push([...batch]);
        batch = [];
      }
    }

    if (batch.length > 0) {
      batches.push(batch);
    }

    // Process batches
    for (let i = 0; i < batches.length; i++) {
      const currentBatch = batches[i];
      console.log(`Processing batch ${i + 1}/${batches.length} (${currentBatch.length} logs)...`);

      if (DRY_RUN) {
        stats.admin_logs.migrated += currentBatch.length;
        continue;
      }

      try {
        await AdminLog.bulkCreate(currentBatch, { validate: true });
        stats.admin_logs.migrated += currentBatch.length;
      } catch (error) {
        console.error(`Error in batch ${i + 1}:`, error.message);
        stats.admin_logs.errors += currentBatch.length;
      }
    }

    console.log(`✅ Admin logs migration completed: ${stats.admin_logs.migrated} migrated, ${stats.admin_logs.errors} errors`);
  } catch (error) {
    console.error('❌ Error migrating admin logs:', error.message);
    throw error;
  }
}

/**
 * Migrate Broadcasts Collection
 */
async function migrateBroadcasts() {
  console.log('\n📊 Migrating Broadcasts...');

  try {
    const snapshot = await db.collection('broadcasts').get();
    stats.broadcasts.total = snapshot.size;
    console.log(`Found ${snapshot.size} broadcasts in Firestore`);

    if (snapshot.empty) {
      console.log('No broadcasts to migrate');
      return;
    }

    const batches = [];
    let batch = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const broadcast = {
        admin_id: parseInt(data.adminId),
        user_id: parseInt(data.userId),
        type: data.type,
        target_group: data.targetGroup,
        message: data.message || null,
        file_id: data.fileId || null,
        status: data.status || 'sent',
        error: data.error || null,
        sent_at: convertTimestamp(data.sentAt) || new Date()
      };

      batch.push(broadcast);

      if (batch.length >= BATCH_SIZE) {
        batches.push([...batch]);
        batch = [];
      }
    }

    if (batch.length > 0) {
      batches.push(batch);
    }

    // Process batches
    for (let i = 0; i < batches.length; i++) {
      const currentBatch = batches[i];
      console.log(`Processing batch ${i + 1}/${batches.length} (${currentBatch.length} broadcasts)...`);

      if (DRY_RUN) {
        stats.broadcasts.migrated += currentBatch.length;
        continue;
      }

      try {
        await Broadcast.bulkCreate(currentBatch, { validate: true });
        stats.broadcasts.migrated += currentBatch.length;
      } catch (error) {
        console.error(`Error in batch ${i + 1}:`, error.message);
        stats.broadcasts.errors += currentBatch.length;
      }
    }

    console.log(`✅ Broadcasts migration completed: ${stats.broadcasts.migrated} migrated, ${stats.broadcasts.errors} errors`);
  } catch (error) {
    console.error('❌ Error migrating broadcasts:', error.message);
    throw error;
  }
}

/**
 * Print final statistics
 */
function printStats() {
  console.log('\n' + '='.repeat(60));
  console.log('MIGRATION SUMMARY');
  console.log('='.repeat(60));

  const totalRecords = Object.values(stats).reduce((sum, s) => sum + s.total, 0);
  const totalMigrated = Object.values(stats).reduce((sum, s) => sum + s.migrated, 0);
  const totalSkipped = Object.values(stats).reduce((sum, s) => sum + s.skipped, 0);
  const totalErrors = Object.values(stats).reduce((sum, s) => sum + s.errors, 0);

  console.log(`\nTotal Records Found: ${totalRecords}`);
  console.log(`Total Migrated: ${totalMigrated}`);
  console.log(`Total Skipped: ${totalSkipped}`);
  console.log(`Total Errors: ${totalErrors}`);

  console.log('\nBreakdown by Collection:');
  for (const [collection, stat] of Object.entries(stats)) {
    console.log(`\n${collection.toUpperCase()}:`);
    console.log(`  Total: ${stat.total}`);
    console.log(`  Migrated: ${stat.migrated}`);
    console.log(`  Skipped: ${stat.skipped}`);
    console.log(`  Errors: ${stat.errors}`);
  }

  console.log('\n' + '='.repeat(60));

  if (DRY_RUN) {
    console.log('\n⚠️  This was a DRY RUN - no data was actually inserted');
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting Firestore to PostgreSQL Migration');
  console.log('='.repeat(60));
  console.log(`Batch Size: ${BATCH_SIZE}`);
  console.log(`Dry Run: ${DRY_RUN ? 'Yes' : 'No'}`);
  console.log(`Skip Existing: ${SKIP_EXISTING ? 'Yes' : 'No'}`);
  console.log(`Specific Collection: ${SPECIFIC_COLLECTION || 'All'}`);
  console.log('='.repeat(60));

  try {
    // Test PostgreSQL connection
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established');

    // Run migrations based on options
    if (!SPECIFIC_COLLECTION || SPECIFIC_COLLECTION === 'users') {
      await migrateUsers();
    }

    if (!SPECIFIC_COLLECTION || SPECIFIC_COLLECTION === 'plans') {
      await migratePlans();
    }

    if (!SPECIFIC_COLLECTION || SPECIFIC_COLLECTION === 'admin_logs') {
      await migrateAdminLogs();
    }

    if (!SPECIFIC_COLLECTION || SPECIFIC_COLLECTION === 'broadcasts') {
      await migrateBroadcasts();
    }

    printStats();

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    printStats();
    process.exit(1);
  }
}

// Run migration
migrate();
