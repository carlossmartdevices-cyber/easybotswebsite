# PostgreSQL Migration Guide for PNPtv Bot

Complete step-by-step guide for migrating from Firestore to PostgreSQL.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Migration Steps](#detailed-migration-steps)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)
6. [Rollback Strategy](#rollback-strategy)
7. [Post-Migration Checklist](#post-migration-checklist)

---

## Prerequisites

### Software Requirements

- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v15 or higher
- **npm**: Latest version
- **Docker** (optional): For local PostgreSQL setup

### Access Requirements

- Firestore service account credentials (for data migration)
- PostgreSQL database credentials (host, port, user, password)
- Admin access to your server/hosting environment

---

## Quick Start

For experienced developers who want to migrate quickly:

```bash
# 1. Install dependencies
npm install

# 2. Set up PostgreSQL (Docker option)
cd database
docker-compose up -d

# 3. Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 4. Run migrations
npm run db:migrate

# 5. Migrate data from Firestore (dry run first)
npm run migrate:firestore:dry-run

# 6. Migrate data (actual)
npm run migrate:firestore

# 7. Run tests
npm test

# 8. Update code to use PostgreSQL services
# See "Code Migration" section below

# 9. Start the bot
npm start
```

---

## Detailed Migration Steps

### Phase 1: PostgreSQL Setup

#### Option A: Using Docker (Recommended for Development)

1. **Navigate to the database directory:**
   ```bash
   cd database
   ```

2. **Review and customize docker-compose.yml:**
   ```bash
   nano docker-compose.yml
   ```

   Update environment variables if needed:
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DB`

3. **Start PostgreSQL container:**
   ```bash
   docker-compose up -d
   ```

4. **Verify PostgreSQL is running:**
   ```bash
   docker-compose ps
   docker-compose logs postgres
   ```

5. **Access pgAdmin (optional):**
   Open browser: http://localhost:5050
   - Email: admin@pnptv.com (or your custom value)
   - Password: admin (or your custom value)

#### Option B: Cloud-Hosted PostgreSQL

Choose one of the following providers:

**Supabase** (Recommended):
1. Go to https://supabase.com
2. Create a new project
3. Navigate to Project Settings > Database
4. Copy the connection string

**Neon**:
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string

**DigitalOcean Managed Database**:
1. Go to DigitalOcean > Databases
2. Create a PostgreSQL database
3. Copy connection details

**AWS RDS**:
1. Go to AWS Console > RDS
2. Create a PostgreSQL instance
3. Configure security groups
4. Copy connection details

#### Option C: Self-Hosted PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE USER pnptv WITH PASSWORD 'your_secure_password';
CREATE DATABASE pnptv_prod OWNER pnptv;
CREATE DATABASE pnptv_test OWNER pnptv;
GRANT ALL PRIVILEGES ON DATABASE pnptv_prod TO pnptv;
GRANT ALL PRIVILEGES ON DATABASE pnptv_test TO pnptv;
\q
```

---

### Phase 2: Environment Configuration

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file:**
   ```bash
   nano .env
   ```

3. **Configure PostgreSQL settings:**
   ```env
   # PostgreSQL Configuration
   DB_HOST=localhost  # Or your cloud provider host
   DB_PORT=5432
   DB_USER=pnptv
   DB_PASSWORD=your_secure_password_here
   DB_NAME=pnptv_prod
   DB_NAME_TEST=pnptv_test
   DB_SSL=false  # Set to 'true' for cloud providers
   ```

4. **Keep Firebase credentials (temporarily for migration):**
   ```env
   # Keep these for data migration
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   ```

5. **Verify other environment variables:**
   ```env
   BOT_TOKEN=your_bot_token
   ADMIN_IDS=123456789,987654321
   REDIS_URL=redis://localhost:6379
   NODE_ENV=development
   ```

---

### Phase 3: Install Dependencies

1. **Install new PostgreSQL dependencies:**
   ```bash
   npm install
   ```

   This will install:
   - `pg` - PostgreSQL client
   - `pg-hstore` - PostgreSQL hstore support
   - `sequelize` - ORM for PostgreSQL
   - `sequelize-cli` - Migration tool

2. **Verify installation:**
   ```bash
   npx sequelize-cli --version
   ```

---

### Phase 4: Database Schema Setup

1. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

   This will create:
   - `users` table
   - `plans` table
   - `admin_logs` table
   - `broadcasts` table
   - All indexes and constraints
   - Default plans (basic, premium, gold)

2. **Verify schema creation:**
   ```bash
   # Using psql
   psql -h localhost -U pnptv -d pnptv_prod -c "\dt"

   # Or using Docker
   docker exec -it pnptv_postgres psql -U pnptv -d pnptv_prod -c "\dt"
   ```

   Expected output:
   ```
                List of relations
    Schema |     Name     | Type  | Owner
   --------+--------------+-------+-------
    public | admin_logs   | table | pnptv
    public | broadcasts   | table | pnptv
    public | plans        | table | pnptv
    public | users        | table | pnptv
   ```

3. **Check indexes:**
   ```bash
   psql -h localhost -U pnptv -d pnptv_prod -c "\di"
   ```

---

### Phase 5: Data Migration from Firestore

⚠️ **IMPORTANT**: Always run a dry-run first!

#### Step 1: Dry Run (No Data Written)

```bash
npm run migrate:firestore:dry-run
```

This will:
- Connect to both Firestore and PostgreSQL
- Read all Firestore collections
- Transform data to PostgreSQL format
- Display what would be migrated
- NOT write any data

Review the output carefully for:
- Total records found in each collection
- Any data transformation warnings
- Potential conflicts

#### Step 2: Actual Migration

If dry run looks good, proceed with actual migration:

```bash
npm run migrate:firestore
```

#### Step 3: Advanced Migration Options

**Migrate specific collection:**
```bash
node database/migrate-firestore-to-postgres.js --collection=users
```

**Custom batch size:**
```bash
node database/migrate-firestore-to-postgres.js --batch-size=50
```

**Skip existing records (prevent duplicates):**
```bash
node database/migrate-firestore-to-postgres.js --skip-existing
```

**Combine options:**
```bash
node database/migrate-firestore-to-postgres.js \
  --collection=users \
  --batch-size=100 \
  --skip-existing
```

#### Step 4: Verify Migration

1. **Check record counts:**
   ```bash
   psql -h localhost -U pnptv -d pnptv_prod -c "
   SELECT 'users' as table, COUNT(*) as count FROM users
   UNION ALL
   SELECT 'plans', COUNT(*) FROM plans
   UNION ALL
   SELECT 'admin_logs', COUNT(*) FROM admin_logs
   UNION ALL
   SELECT 'broadcasts', COUNT(*) FROM broadcasts;
   "
   ```

2. **Sample data verification:**
   ```bash
   # Check users
   psql -h localhost -U pnptv -d pnptv_prod -c "
   SELECT telegram_id, username, plan, status, created_at
   FROM users
   LIMIT 5;
   "

   # Check plans
   psql -h localhost -U pnptv -d pnptv_prod -c "
   SELECT name, price, duration, features
   FROM plans;
   "
   ```

3. **Compare counts with Firestore:**
   - Go to Firebase Console
   - Check collection counts
   - Ensure they match PostgreSQL counts

---

### Phase 6: Code Migration

The following files have been created to replace Firestore:

#### New Files Structure:

```
src/
├── config/
│   └── database.js          # PostgreSQL connection
├── models/
│   ├── index.js             # Model exports
│   ├── User.js              # User model
│   ├── Plan.js              # Plan model
│   ├── AdminLog.js          # Admin log model
│   └── Broadcast.js         # Broadcast model
└── services/
    ├── UserService.js       # User operations
    ├── PlanService.js       # Plan operations
    ├── AdminLogService.js   # Admin logging
    └── BroadcastService.js  # Broadcast tracking
```

#### Update Handler Files

You need to update the following handler files to use the new services:

**1. Update `src/bot/handlers/admin/dashboard.js`:**

Replace:
```javascript
const { db } = require('../../../config/firebase');
```

With:
```javascript
const UserService = require('../../../services/UserService');
const PlanService = require('../../../services/PlanService');
```

Replace Firestore queries with service calls:
```javascript
// Old (Firestore)
const usersCount = await db.collection('users').count().get();

// New (PostgreSQL)
const stats = await UserService.getStatistics();
const usersCount = stats.total;
```

**2. Update `src/bot/handlers/admin/users.js`:**

Replace:
```javascript
const { db } = require('../../../config/firebase');
```

With:
```javascript
const UserService = require('../../../services/UserService');
```

Example replacements:
```javascript
// Search by username
// Old:
const snapshot = await db.collection('users')
  .where('username', '==', searchTerm)
  .get();

// New:
const users = await UserService.searchByUsername(searchTerm);

// Update user status
// Old:
await db.collection('users').doc(userId).update({ status: 'active' });

// New:
await UserService.updateStatus(userId, 'active');

// Extend subscription
// Old:
const newEnd = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000);
await db.collection('users').doc(userId).update({ subscriptionEnd: newEnd });

// New:
await UserService.extendSubscription(userId, days);
```

**3. Update `src/bot/handlers/admin/plans.js`:**

Replace:
```javascript
const { db } = require('../../../config/firebase');
```

With:
```javascript
const PlanService = require('../../../services/PlanService');
```

**4. Update `src/bot/handlers/admin/analytics.js`:**

Replace:
```javascript
const { db } = require('../../../config/firebase');
```

With:
```javascript
const UserService = require('../../../services/UserService');
const PlanService = require('../../../services/PlanService');
```

**5. Update `src/bot/handlers/admin/broadcast.js`:**

Replace:
```javascript
const { db } = require('../../../config/firebase');
```

With:
```javascript
const UserService = require('../../../services/UserService');
const BroadcastService = require('../../../services/BroadcastService');
```

**6. Update `src/bot/utils/adminLogger.js`:**

Replace:
```javascript
const { db } = require('../../config/firebase');

async function logAdminAction(adminId, action, target, metadata, status, error) {
  await db.collection('admin_logs').add({
    adminId,
    action,
    target,
    metadata,
    status,
    error,
    timestamp: new Date()
  });
}
```

With:
```javascript
const AdminLogService = require('../../services/AdminLogService');

async function logAdminAction(adminId, action, target, metadata, status, error) {
  await AdminLogService.logAction(adminId, action, target, metadata, status, error);
}
```

#### Migration Helper Script

Create a helper script to find all Firestore references:

```bash
# Find all Firestore imports
grep -r "require.*firebase" src/

# Find all db.collection usage
grep -r "db\.collection" src/

# Find all Firestore queries
grep -r "\.get()" src/ | grep -v node_modules
```

---

### Phase 7: Testing

#### Unit Tests

1. **Run all tests:**
   ```bash
   npm test
   ```

2. **Run specific test suites:**
   ```bash
   # Test models
   npm test -- tests/models/

   # Test services
   npm test -- tests/services/

   # Test specific file
   npm test -- tests/models/User.test.js
   ```

3. **Run tests with coverage:**
   ```bash
   npm test -- --coverage
   ```

#### Integration Testing

1. **Test database connection:**
   ```bash
   node -e "
   const { sequelize } = require('./src/models');
   sequelize.authenticate()
     .then(() => console.log('✅ Connection successful'))
     .catch(err => console.error('❌ Connection failed:', err));
   "
   ```

2. **Test CRUD operations:**
   ```bash
   node -e "
   const UserService = require('./src/services/UserService');
   (async () => {
     const { user } = await UserService.upsert(999999999, {
       username: 'test_user',
       first_name: 'Test'
     });
     console.log('✅ User created:', user.username);

     const found = await UserService.findByTelegramId(999999999);
     console.log('✅ User found:', found.username);

     await UserService.updateStatus(999999999, 'inactive');
     console.log('✅ User updated');
   })();
   "
   ```

#### Manual Testing

1. **Start the bot in development mode:**
   ```bash
   npm run dev
   ```

2. **Test key features:**
   - [ ] User registration
   - [ ] Admin dashboard
   - [ ] User search
   - [ ] Plan management
   - [ ] User status updates
   - [ ] Subscription extension
   - [ ] Broadcasting
   - [ ] Analytics

3. **Monitor logs:**
   ```bash
   # Watch bot logs
   tail -f logs/bot.log

   # Watch database queries (if logging enabled)
   tail -f logs/database.log
   ```

---

## Troubleshooting

### Common Issues

#### 1. Connection Refused

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
- Verify PostgreSQL is running: `docker-compose ps` or `systemctl status postgresql`
- Check DB_HOST and DB_PORT in .env
- Verify firewall rules
- For cloud databases, check IP whitelist

#### 2. Authentication Failed

**Error:**
```
Error: password authentication failed for user "pnptv"
```

**Solutions:**
- Verify DB_USER and DB_PASSWORD in .env
- Check PostgreSQL user exists: `psql -U postgres -c "\du"`
- Reset password if needed:
  ```sql
  ALTER USER pnptv WITH PASSWORD 'new_password';
  ```

#### 3. SSL Required

**Error:**
```
Error: no pg_hba.conf entry for host
```

**Solutions:**
- Set `DB_SSL=true` in .env for cloud databases
- For Supabase/Neon, SSL is required
- For local Docker, use `DB_SSL=false`

#### 4. Migration Fails

**Error:**
```
Error: relation "users" already exists
```

**Solutions:**
```bash
# Reset database
npm run db:migrate:undo:all
npm run db:migrate

# Or drop and recreate database
psql -U postgres -c "DROP DATABASE pnptv_prod;"
psql -U postgres -c "CREATE DATABASE pnptv_prod OWNER pnptv;"
npm run db:migrate
```

#### 5. Firestore Migration Errors

**Error:**
```
Error: Could not load the default credentials
```

**Solutions:**
- Verify FIREBASE_SERVICE_ACCOUNT is valid JSON
- Check service account has Firestore permissions
- Ensure FIREBASE_DATABASE_URL is correct

#### 6. Data Type Mismatches

**Error:**
```
Error: invalid input syntax for type bigint
```

**Solutions:**
- Check telegram_id is a number, not string
- Verify data types in migration script
- Use `parseInt()` for numeric fields

---

## Rollback Strategy

### If Migration Fails

#### Option 1: Keep Using Firestore

1. **Don't delete Firestore code:**
   - Keep Firebase configuration
   - Keep old handler files
   - Revert to previous commit

2. **Disable PostgreSQL code:**
   ```bash
   git checkout HEAD -- src/models/
   git checkout HEAD -- src/services/
   ```

#### Option 2: Dual-Write Mode

Run both databases in parallel during transition:

```javascript
// Example dual-write wrapper
async function createUser(userData) {
  // Write to both databases
  const [firestoreUser, postgresUser] = await Promise.all([
    createUserFirestore(userData),
    UserService.upsert(userData.telegram_id, userData)
  ]);

  return postgresUser.user;
}
```

### Database Backups

#### Before Migration

1. **Backup Firestore:**
   ```bash
   gcloud firestore export gs://your-bucket/backup-$(date +%Y%m%d)
   ```

2. **Backup PostgreSQL (after migration):**
   ```bash
   pg_dump -h localhost -U pnptv -d pnptv_prod > backup_$(date +%Y%m%d).sql
   ```

#### Restore from Backup

```bash
# Restore PostgreSQL
psql -h localhost -U pnptv -d pnptv_prod < backup_20250114.sql
```

---

## Post-Migration Checklist

### Immediate (Day 1)

- [ ] Verify all data migrated correctly
- [ ] Run full test suite
- [ ] Test bot in production
- [ ] Monitor error logs closely
- [ ] Keep Firestore running (don't delete yet)
- [ ] Create PostgreSQL backup

### Week 1

- [ ] Monitor performance metrics
- [ ] Check query response times
- [ ] Verify no data inconsistencies
- [ ] Test all admin features
- [ ] Run analytics reports
- [ ] Optimize slow queries if needed

### Week 2

- [ ] Review database logs
- [ ] Check index usage
- [ ] Optimize connection pool settings
- [ ] Set up automated backups
- [ ] Configure monitoring/alerts

### Month 1

- [ ] Remove Firestore dependencies from package.json
- [ ] Delete `src/config/firebase.js`
- [ ] Remove Firebase environment variables
- [ ] Cancel Firebase subscription
- [ ] Update documentation
- [ ] Archive Firestore backups

---

## Performance Optimization

### Connection Pooling

Adjust pool size based on load:

```javascript
// database/config.js
pool: {
  max: 20,      // Maximum connections
  min: 5,       // Minimum connections
  acquire: 60000,  // Max time to get connection
  idle: 10000      // Max idle time
}
```

### Query Optimization

1. **Use EXPLAIN ANALYZE:**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM users WHERE plan = 'premium' AND status = 'active';
   ```

2. **Add missing indexes:**
   ```sql
   CREATE INDEX idx_custom ON users(column_name);
   ```

3. **Use database views for complex queries:**
   ```sql
   -- Already created in schema.sql
   SELECT * FROM active_subscriptions;
   SELECT * FROM user_stats_by_plan;
   ```

### Monitoring

1. **Enable query logging (development):**
   ```javascript
   // database/config.js
   logging: console.log  // Or use winston/bunyan
   ```

2. **Monitor slow queries:**
   ```sql
   -- Enable in PostgreSQL
   ALTER DATABASE pnptv_prod SET log_min_duration_statement = 1000; -- Log queries > 1s
   ```

3. **Check connection usage:**
   ```sql
   SELECT count(*) FROM pg_stat_activity WHERE datname = 'pnptv_prod';
   ```

---

## Support and Resources

### Documentation

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg Driver](https://node-postgres.com/)

### Getting Help

- Check logs: `npm run dev` with logging enabled
- Database logs: `docker-compose logs postgres`
- GitHub Issues: [Report bugs here]

### Monitoring Tools

- **pgAdmin**: Web UI for PostgreSQL management
- **pg_stat_statements**: Query performance tracking
- **DataDog/New Relic**: APM for production monitoring

---

## Congratulations! 🎉

You've successfully migrated from Firestore to PostgreSQL!

Your PNPtv bot now benefits from:
- ✅ Better query performance
- ✅ Advanced SQL capabilities
- ✅ Lower costs (potentially)
- ✅ Better data integrity with foreign keys
- ✅ Powerful analytics with SQL
- ✅ Mature ecosystem and tooling

**Next Steps:**
1. Monitor performance for 1-2 weeks
2. Optimize queries based on usage patterns
3. Set up automated backups
4. Remove Firestore dependencies once stable
5. Enjoy your PostgreSQL-powered bot! 🚀
