# PostgreSQL Database for PNPtv Bot

This directory contains all PostgreSQL-related files for the PNPtv Telegram bot.

## Directory Structure

```
database/
├── README.md                           # This file
├── .sequelizerc                        # Sequelize CLI configuration
├── config.js                           # Database connection config
├── docker-compose.yml                  # Docker setup for PostgreSQL
├── schema.sql                          # Complete database schema
├── migrate-firestore-to-postgres.js    # Data migration script
└── migrations/                         # Sequelize migrations
    ├── 20250114000001-create-users.js
    ├── 20250114000002-create-plans.js
    ├── 20250114000003-create-admin-logs.js
    ├── 20250114000004-create-broadcasts.js
    ├── 20250114000005-seed-default-plans.js
    └── 20250114000006-add-text-search-indexes.js
```

## Database Schema

### Tables

#### users
Stores all user data, subscriptions, and profile information.

**Columns:**
- `id` (UUID, PK) - Unique identifier
- `telegram_id` (BIGINT, UNIQUE) - Telegram user ID
- `username` (VARCHAR) - Telegram username
- `first_name` (VARCHAR) - User's first name
- `last_name` (VARCHAR) - User's last name
- `plan` (VARCHAR) - Subscription plan (basic, premium, gold)
- `status` (VARCHAR) - Account status (active, inactive)
- `subscription_end` (TIMESTAMPTZ) - Subscription expiration
- `bio` (TEXT) - User biography
- `location_city` (VARCHAR) - User's city
- `location_latitude` (DECIMAL) - Location latitude
- `location_longitude` (DECIMAL) - Location longitude
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp
- `last_active` (TIMESTAMPTZ) - Last activity timestamp

**Indexes:**
- `telegram_id` - Fast user lookup
- `username` - Search by username
- `plan` - Filter by subscription plan
- `status` - Filter by user status
- `created_at` - Sort by join date
- `last_active` - Find active users
- `subscription_end` - Find expiring subscriptions
- GIN indexes on `username` and `first_name` for text search

#### plans
Stores subscription plan configurations.

**Columns:**
- `id` (UUID, PK) - Unique identifier
- `name` (VARCHAR, UNIQUE) - Plan name
- `price` (DECIMAL) - Monthly price
- `duration` (INTEGER) - Duration in days
- `features` (JSONB) - Array of features
- `status` (VARCHAR) - Plan status (active, inactive)
- `created_by` (BIGINT) - Admin who created the plan
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes:**
- `name` - Fast plan lookup
- `status` - Filter active plans

#### admin_logs
Audit trail of administrative actions.

**Columns:**
- `id` (UUID, PK) - Unique identifier
- `admin_id` (BIGINT) - Admin Telegram ID
- `action` (VARCHAR) - Action performed
- `target` (VARCHAR) - Target of action
- `metadata` (JSONB) - Additional context
- `status` (VARCHAR) - Action result (success, failed, partial)
- `error` (TEXT) - Error message if failed
- `timestamp` (TIMESTAMPTZ) - Action timestamp

**Indexes:**
- `admin_id` - Filter by admin
- `action` - Filter by action type
- `timestamp` - Sort by time
- `target` - Find actions on specific target

#### broadcasts
Tracks broadcast messages sent to users.

**Columns:**
- `id` (UUID, PK) - Unique identifier
- `admin_id` (BIGINT) - Admin who sent broadcast
- `user_id` (BIGINT) - Recipient Telegram ID
- `type` (VARCHAR) - Message type (text, photo, video)
- `target_group` (VARCHAR) - Target group (all, premium, free, gold, basic)
- `message` (TEXT) - Message content
- `file_id` (VARCHAR) - Telegram file ID for media
- `status` (VARCHAR) - Delivery status (sent, failed)
- `error` (TEXT) - Error message if failed
- `sent_at` (TIMESTAMPTZ) - Delivery timestamp

**Indexes:**
- `admin_id` - Filter by sender
- `user_id` - Filter by recipient
- `sent_at` - Sort by time
- `status` - Filter by delivery status
- `target_group` - Filter by target group

### Views

#### active_subscriptions
Shows users with valid subscriptions.

```sql
SELECT * FROM active_subscriptions;
```

#### user_stats_by_plan
Statistics grouped by subscription plan.

```sql
SELECT * FROM user_stats_by_plan;
```

#### broadcast_stats
Broadcast delivery statistics.

```sql
SELECT * FROM broadcast_stats;
```

## Quick Commands

### Using Docker

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs -f postgres

# Access PostgreSQL CLI
docker exec -it pnptv_postgres psql -U pnptv -d pnptv_prod

# Backup database
docker exec pnptv_postgres pg_dump -U pnptv pnptv_prod > backup.sql

# Restore database
cat backup.sql | docker exec -i pnptv_postgres psql -U pnptv -d pnptv_prod
```

### Using Native PostgreSQL

```bash
# Connect to database
psql -h localhost -U pnptv -d pnptv_prod

# Run migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Seed database
npm run db:seed

# Migrate data from Firestore
npm run migrate:firestore

# Dry run (no data written)
npm run migrate:firestore:dry-run
```

## Common Queries

### User Statistics

```sql
-- Total users by plan
SELECT plan, COUNT(*) as count
FROM users
WHERE status = 'active'
GROUP BY plan;

-- New users today
SELECT COUNT(*)
FROM users
WHERE created_at >= CURRENT_DATE;

-- Active users last 7 days
SELECT COUNT(*)
FROM users
WHERE last_active >= NOW() - INTERVAL '7 days';
```

### Revenue Calculations

```sql
-- Monthly Recurring Revenue (MRR)
SELECT
  p.name,
  p.price,
  COUNT(u.id) as users,
  (p.price * COUNT(u.id)) as mrr
FROM plans p
LEFT JOIN users u ON LOWER(u.plan) = LOWER(p.name)
  AND u.status = 'active'
WHERE p.status = 'active'
GROUP BY p.name, p.price;
```

### Broadcast Analytics

```sql
-- Delivery rate by target group
SELECT
  target_group,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
  ROUND(
    COUNT(CASE WHEN status = 'sent' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100,
    2
  ) as success_rate
FROM broadcasts
GROUP BY target_group;
```

### Admin Activity

```sql
-- Most active admins
SELECT
  admin_id,
  COUNT(*) as actions,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as successful
FROM admin_logs
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY admin_id
ORDER BY actions DESC;
```

## Maintenance

### Database Backups

**Automated Daily Backup (cron):**

```bash
# Add to crontab
0 2 * * * docker exec pnptv_postgres pg_dump -U pnptv pnptv_prod > /backups/pnptv_$(date +\%Y\%m\%d).sql
```

**Manual Backup:**

```bash
pg_dump -h localhost -U pnptv -d pnptv_prod > backup_$(date +%Y%m%d).sql
```

### Vacuum and Analyze

```sql
-- Regular maintenance
VACUUM ANALYZE users;
VACUUM ANALYZE plans;
VACUUM ANALYZE admin_logs;
VACUUM ANALYZE broadcasts;

-- Or all tables
VACUUM ANALYZE;
```

### Reindex

```sql
-- Rebuild indexes
REINDEX DATABASE pnptv_prod;
```

### Clear Old Logs

```sql
-- Delete admin logs older than 90 days
DELETE FROM admin_logs WHERE timestamp < NOW() - INTERVAL '90 days';

-- Delete broadcasts older than 90 days
DELETE FROM broadcasts WHERE sent_at < NOW() - INTERVAL '90 days';
```

## Monitoring

### Connection Status

```sql
-- Current connections
SELECT
  datname,
  count(*) as connections
FROM pg_stat_activity
GROUP BY datname;
```

### Database Size

```sql
-- Table sizes
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Index Usage

```sql
-- Unused indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'pg_toast%';
```

### Slow Queries

```sql
-- Enable pg_stat_statements extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Security

### User Permissions

```sql
-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE pnptv_prod TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;
```

### SSL Configuration

For production, always use SSL:

```env
DB_SSL=true
```

### IP Whitelisting

Configure `pg_hba.conf` to restrict access:

```
# Allow connections from application servers only
host    pnptv_prod    pnptv    10.0.0.0/8    md5
```

## Troubleshooting

### Connection Issues

1. Check PostgreSQL is running: `docker-compose ps`
2. Verify credentials in `.env`
3. Check firewall rules
4. Test connection: `psql -h localhost -U pnptv -d pnptv_prod`

### Performance Issues

1. Run `EXPLAIN ANALYZE` on slow queries
2. Check index usage
3. Increase connection pool size
4. Run `VACUUM ANALYZE`

### Disk Space

```sql
-- Find large tables
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Sequelize Docs](https://sequelize.org/docs/v6/)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [pgAdmin](http://localhost:5050) - Web UI for database management

## Support

For migration issues, see [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md)

For general questions, check the main README.md
