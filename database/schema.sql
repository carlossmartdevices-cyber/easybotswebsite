-- PNPtv Bot PostgreSQL Database Schema
-- Version: 1.0.0
-- Description: Complete schema for migrating from Firestore to PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Stores all user data, subscriptions, and profile information
CREATE TABLE users (
    -- Primary identifier (UUID for PostgreSQL best practices)
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Telegram-specific identifiers
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),

    -- Subscription details
    plan VARCHAR(50) NOT NULL DEFAULT 'basic',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    subscription_end TIMESTAMPTZ,

    -- Profile information
    bio TEXT,
    location_city VARCHAR(255),
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT check_status CHECK (status IN ('active', 'inactive')),
    CONSTRAINT check_plan CHECK (plan IN ('basic', 'premium', 'gold')),
    CONSTRAINT check_location CHECK (
        (location_city IS NULL AND location_latitude IS NULL AND location_longitude IS NULL) OR
        (location_city IS NOT NULL AND location_latitude IS NOT NULL AND location_longitude IS NOT NULL)
    )
);

-- ============================================================================
-- PLANS TABLE
-- ============================================================================
-- Stores subscription plan configurations and pricing
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Plan details
    name VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration INTEGER NOT NULL, -- Duration in days
    features JSONB NOT NULL DEFAULT '[]', -- Array of features as JSON

    -- Status and metadata
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_by BIGINT, -- Admin Telegram ID who created the plan

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT check_plan_status CHECK (status IN ('active', 'inactive')),
    CONSTRAINT check_price CHECK (price >= 0),
    CONSTRAINT check_duration CHECK (duration > 0)
);

-- ============================================================================
-- ADMIN_LOGS TABLE
-- ============================================================================
-- Tracks all administrative actions for audit trail
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Admin and action details
    admin_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target VARCHAR(255), -- Target user ID, plan ID, or 'all_users', etc.

    -- Action metadata and results
    metadata JSONB DEFAULT '{}', -- Additional data about the action
    status VARCHAR(20) NOT NULL DEFAULT 'success',
    error TEXT, -- Error message if status is 'failed'

    -- Timestamp
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT check_log_status CHECK (status IN ('success', 'failed', 'partial'))
);

-- ============================================================================
-- BROADCASTS TABLE
-- ============================================================================
-- Tracks broadcast messages sent to users
CREATE TABLE broadcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Sender and recipient
    admin_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL, -- Telegram ID of recipient

    -- Broadcast details
    type VARCHAR(20) NOT NULL,
    target_group VARCHAR(50) NOT NULL,
    message TEXT,
    file_id VARCHAR(255), -- Telegram file ID for media

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'sent',
    error TEXT, -- Error message if delivery failed

    -- Timestamp
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT check_broadcast_type CHECK (type IN ('text', 'photo', 'video')),
    CONSTRAINT check_broadcast_target CHECK (target_group IN ('all', 'premium', 'free', 'gold', 'basic')),
    CONSTRAINT check_broadcast_status CHECK (status IN ('sent', 'failed'))
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users table indexes
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_plan ON users(plan);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_active ON users(last_active);
CREATE INDEX idx_users_subscription_end ON users(subscription_end);
-- Text search index for username and first_name
CREATE INDEX idx_users_username_trgm ON users USING gin (username gin_trgm_ops);
CREATE INDEX idx_users_first_name_trgm ON users USING gin (first_name gin_trgm_ops);

-- Plans table indexes
CREATE INDEX idx_plans_name ON plans(name);
CREATE INDEX idx_plans_status ON plans(status);
CREATE INDEX idx_plans_created_at ON plans(created_at);

-- Admin logs table indexes
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_timestamp ON admin_logs(timestamp DESC);
CREATE INDEX idx_admin_logs_target ON admin_logs(target);

-- Broadcasts table indexes
CREATE INDEX idx_broadcasts_admin_id ON broadcasts(admin_id);
CREATE INDEX idx_broadcasts_user_id ON broadcasts(user_id);
CREATE INDEX idx_broadcasts_sent_at ON broadcasts(sent_at DESC);
CREATE INDEX idx_broadcasts_status ON broadcasts(status);
CREATE INDEX idx_broadcasts_target_group ON broadcasts(target_group);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for plans table
CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active users with valid subscriptions
CREATE VIEW active_subscriptions AS
SELECT
    u.id,
    u.telegram_id,
    u.username,
    u.first_name,
    u.last_name,
    u.plan,
    u.subscription_end,
    u.created_at,
    p.price,
    p.features
FROM users u
LEFT JOIN plans p ON LOWER(u.plan) = LOWER(p.name)
WHERE u.status = 'active'
    AND (u.subscription_end IS NULL OR u.subscription_end > NOW());

-- User statistics by plan
CREATE VIEW user_stats_by_plan AS
SELECT
    plan,
    COUNT(*) as total_users,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d,
    COUNT(CASE WHEN last_active >= NOW() - INTERVAL '7 days' THEN 1 END) as active_7d
FROM users
GROUP BY plan;

-- Broadcast delivery statistics
CREATE VIEW broadcast_stats AS
SELECT
    admin_id,
    target_group,
    type,
    DATE(sent_at) as broadcast_date,
    COUNT(*) as total_sent,
    COUNT(CASE WHEN status = 'sent' THEN 1 END) as successful,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
    ROUND(COUNT(CASE WHEN status = 'sent' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100, 2) as success_rate
FROM broadcasts
GROUP BY admin_id, target_group, type, DATE(sent_at);

-- ============================================================================
-- SEED DATA (Optional - Basic Plans)
-- ============================================================================

-- Insert default plans
INSERT INTO plans (name, price, duration, features, status) VALUES
    ('basic', 0, 30, '["Basic features", "Standard support"]', 'active'),
    ('premium', 9.99, 30, '["All basic features", "Priority support", "Advanced features", "No ads"]', 'active'),
    ('gold', 19.99, 30, '["All premium features", "24/7 VIP support", "Exclusive content", "Early access to new features"]', 'active')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'Stores all user data including Telegram information, subscriptions, and profile details';
COMMENT ON TABLE plans IS 'Subscription plan configurations with pricing and features';
COMMENT ON TABLE admin_logs IS 'Audit trail of all administrative actions';
COMMENT ON TABLE broadcasts IS 'Record of broadcast messages sent to users';

COMMENT ON COLUMN users.telegram_id IS 'Unique Telegram user ID';
COMMENT ON COLUMN users.subscription_end IS 'Timestamp when the current subscription expires';
COMMENT ON COLUMN plans.features IS 'JSON array of plan features as strings';
COMMENT ON COLUMN admin_logs.metadata IS 'JSON object containing additional context about the action';
