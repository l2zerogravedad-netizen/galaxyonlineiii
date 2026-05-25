-- DESTOCK SPACE - Common Database Schema
-- Única base de datos para todos los clientes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned', 'suspended');
CREATE TYPE item_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic');
CREATE TYPE item_category AS ENUM ('weapon', 'armor', 'module', 'resource');
CREATE TYPE ship_type AS ENUM ('fighter', 'cruiser', 'battleship', 'carrier', 'frigate', 'destroyer', 'explorer', 'miner');
CREATE TYPE ship_class AS ENUM ('light', 'medium', 'heavy', 'capital');
CREATE TYPE ship_status AS ENUM ('active', 'inactive', 'combat', 'docked', 'traveling', 'destroyed', 'repairing');
CREATE TYPE resource_type AS ENUM ('metal', 'plasma', 'energy', 'crystals', 'exotics', 'quantum', 'dark_matter', 'credits');
CREATE TYPE transaction_type AS ENUM ('transfer', 'purchase', 'sale', 'reward', 'penalty', 'refund');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled', 'disputed');
CREATE TYPE marketplace_status AS ENUM ('active', 'sold', 'expired', 'cancelled', 'pending');
CREATE TYPE combat_status AS ENUM ('waiting', 'active', 'paused', 'completed', 'aborted');
CREATE TYPE battle_type AS ENUM ('pvp', 'pve', 'tournament', 'training', 'alliance_war');
CREATE TYPE alliance_rank AS ENUM ('leader', 'officer', 'veteran', 'member', 'recruit');
CREATE TYPE crew_role AS ENUM ('commander', 'pilot', 'gunner', 'engineer', 'science', 'medical', 'security', 'navigation');
CREATE TYPE achievement_category AS ENUM ('combat', 'economy', 'exploration', 'social', 'special');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    status user_status DEFAULT 'active',
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    credits BIGINT DEFAULT 1000,
    avatar VARCHAR(500),
    title VARCHAR(100),
    alliance_id UUID REFERENCES alliances(id),
    ban_reason TEXT,
    ban_expires_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- User statistics
CREATE TABLE user_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_play_time BIGINT DEFAULT 0, -- in seconds
    battles_won INTEGER DEFAULT 0,
    battles_lost INTEGER DEFAULT 0,
    resources_collected BIGINT DEFAULT 0,
    items_crafted INTEGER DEFAULT 0,
    transactions_completed INTEGER DEFAULT 0,
    achievements_unlocked INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'en',
    notifications JSONB DEFAULT '{
        "combat": true,
        "trade": true,
        "alliance": true,
        "system": true,
        "marketing": false
    }'::jsonb,
    privacy JSONB DEFAULT '{
        "profileVisible": true,
        "showOnlineStatus": true,
        "allowFriendRequests": true,
        "showStatistics": true
    }'::jsonb,
    game JSONB DEFAULT '{
        "autoSave": true,
        "graphicsQuality": "medium",
        "soundVolume": 80,
        "musicVolume": 60,
        "cameraMode": "follow"
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type resource_type NOT NULL,
    amount DECIMAL(20,8) DEFAULT 0,
    max_amount DECIMAL(20,8) DEFAULT 1000,
    production_rate DECIMAL(20,8) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, type)
);

-- Inventory items
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category item_category NOT NULL,
    rarity item_rarity NOT NULL,
    quantity INTEGER DEFAULT 1,
    quality INTEGER DEFAULT 100 CHECK (quality >= 0 AND quality <= 100),
    properties JSONB DEFAULT '{}'::jsonb,
    equipped BOOLEAN DEFAULT FALSE,
    slot VARCHAR(100),
    durability INTEGER,
    max_durability INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ships
CREATE TABLE ships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type ship_type NOT NULL,
    class ship_class NOT NULL,
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    health_current INTEGER DEFAULT 100,
    health_max INTEGER DEFAULT 100,
    health_regeneration DECIMAL(10,2) DEFAULT 0,
    shield_current INTEGER DEFAULT 0,
    shield_max INTEGER DEFAULT 0,
    shield_regeneration DECIMAL(10,2) DEFAULT 0,
    attack_power INTEGER DEFAULT 10,
    defense INTEGER DEFAULT 10,
    speed INTEGER DEFAULT 10,
    maneuverability INTEGER DEFAULT 10,
    cargo_capacity INTEGER DEFAULT 100,
    sensor_range INTEGER DEFAULT 100,
    stealth INTEGER DEFAULT 0,
    position_x DECIMAL(15,2) DEFAULT 0,
    position_y DECIMAL(15,2) DEFAULT 0,
    position_z DECIMAL(15,2) DEFAULT 0,
    position_system_id VARCHAR(100) DEFAULT 'alpha',
    rotation_x DECIMAL(5,4) DEFAULT 0,
    rotation_y DECIMAL(5,4) DEFAULT 0,
    rotation_z DECIMAL(5,4) DEFAULT 0,
    rotation_w DECIMAL(5,4) DEFAULT 1,
    status ship_status DEFAULT 'active',
    commander_id UUID,
    crew_current INTEGER DEFAULT 1,
    crew_max INTEGER DEFAULT 1,
    crew_morale INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ship equipment
CREATE TABLE ship_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ship_id UUID NOT NULL REFERENCES ships(id) ON DELETE CASCADE,
    item_id VARCHAR(100) NOT NULL,
    slot VARCHAR(100) NOT NULL,
    durability INTEGER,
    max_durability INTEGER,
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ship_id, slot)
);

-- Crew members
CREATE TABLE crew_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ship_id UUID REFERENCES ships(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- for commanders
    name VARCHAR(100) NOT NULL,
    role crew_role NOT NULL,
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    skills TEXT[] DEFAULT '{}',
    efficiency INTEGER DEFAULT 100 CHECK (efficiency >= 0 AND efficiency <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace listings
CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_category item_category NOT NULL,
    item_rarity item_rarity NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(20,2) NOT NULL CHECK (price > 0),
    currency VARCHAR(50) DEFAULT 'credits',
    status marketplace_status DEFAULT 'active',
    views INTEGER DEFAULT 0,
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Marketplace offers
CREATE TABLE marketplace_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(20,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(50) DEFAULT 'credits',
    message TEXT,
    status marketplace_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Combat sessions
CREATE TABLE combat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participants JSONB NOT NULL, -- Array of participant objects
    status combat_status DEFAULT 'waiting',
    current_turn UUID REFERENCES users(id),
    turn_order JSONB DEFAULT '[]'::jsonb, -- Array of turn order objects
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    time_limit INTEGER DEFAULT 300, -- seconds
    location_system_id VARCHAR(100) NOT NULL,
    location_x DECIMAL(15,2) DEFAULT 0,
    location_y DECIMAL(15,2) DEFAULT 0,
    location_z DECIMAL(15,2) DEFAULT 0,
    battle_type battle_type NOT NULL,
    settings JSONB DEFAULT '{
        "turnTimeLimit": 30,
        "allowSpectators": true,
        "maxParticipants": 10
    }'::jsonb,
    battle_log JSONB DEFAULT '[]'::jsonb,
    rewards JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Combat participants
CREATE TABLE combat_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    combat_session_id UUID NOT NULL REFERENCES combat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ships JSONB NOT NULL, -- Array of ship IDs and their current state
    ready BOOLEAN DEFAULT FALSE,
    disconnected BOOLEAN DEFAULT FALSE,
    last_action TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(combat_session_id, user_id)
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    resource_type resource_type,
    amount DECIMAL(20,2) NOT NULL,
    fee DECIMAL(20,2) DEFAULT 0,
    status transaction_status DEFAULT 'pending',
    reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alliances
CREATE TABLE alliances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    tag VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    leader_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    credits BIGINT DEFAULT 0,
    metal BIGINT DEFAULT 0,
    plasma BIGINT DEFAULT 0,
    energy BIGINT DEFAULT 0,
    crystals BIGINT DEFAULT 0,
    open_recruitment BOOLEAN DEFAULT TRUE,
    minimum_level INTEGER DEFAULT 1,
    tax_rate DECIMAL(5,2) DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
    permissions JSONB DEFAULT '{
        "canInvite": ["leader", "officer"],
        "canKick": ["leader"],
        "canManageResources": ["leader", "officer"],
        "canDeclareWar": ["leader"],
        "canManageSettings": ["leader"]
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alliance members
CREATE TABLE alliance_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alliance_id UUID NOT NULL REFERENCES alliances(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rank alliance_rank DEFAULT 'member',
    contribution BIGINT DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(alliance_id, user_id)
);

-- Achievements
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category achievement_category NOT NULL,
    type VARCHAR(50) NOT NULL, -- progressive, cumulative, conditional, time_based
    requirements JSONB NOT NULL,
    rewards JSONB DEFAULT '{}'::jsonb,
    points INTEGER DEFAULT 0,
    is_hidden BOOLEAN DEFAULT FALSE,
    is_repeatable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    rewards_claimed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Audit log for tracking changes
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions for authentication
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    client_type VARCHAR(50) DEFAULT 'unknown',
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_alliance_id ON users(alliance_id);
CREATE INDEX idx_users_last_active_at ON users(last_active_at);

CREATE INDEX idx_resources_user_id ON resources(user_id);
CREATE INDEX idx_resources_type ON resources(type);

CREATE INDEX idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX idx_inventory_items_item_id ON inventory_items(item_id);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_rarity ON inventory_items(rarity);

CREATE INDEX idx_ships_user_id ON ships(user_id);
CREATE INDEX idx_ships_type ON ships(type);
CREATE INDEX idx_ships_status ON ships(status);

CREATE INDEX idx_ship_equipment_ship_id ON ship_equipment(ship_id);
CREATE INDEX idx_ship_equipment_slot ON ship_equipment(slot);

CREATE INDEX idx_marketplace_listings_seller_id ON marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_item_category ON marketplace_listings(item_category);
CREATE INDEX idx_marketplace_listings_price ON marketplace_listings(price);
CREATE INDEX idx_marketplace_listings_expires_at ON marketplace_listings(expires_at);

CREATE INDEX idx_combat_sessions_status ON combat_sessions(status);
CREATE INDEX idx_combat_sessions_participants ON combat_sessions USING GIN(participants);
CREATE INDEX idx_combat_participants_session_id ON combat_participants(combat_session_id);
CREATE INDEX idx_combat_participants_user_id ON combat_participants(user_id);

CREATE INDEX idx_transactions_from_user_id ON transactions(from_user_id);
CREATE INDEX idx_transactions_to_user_id ON transactions(to_user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

CREATE INDEX idx_alliances_leader_id ON alliances(leader_id);
CREATE INDEX idx_alliance_members_alliance_id ON alliance_members(alliance_id);
CREATE INDEX idx_alliance_members_user_id ON alliance_members(user_id);
CREATE INDEX idx_alliance_members_rank ON alliance_members(rank);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_completed ON user_achievements(completed);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_is_active ON sessions(is_active);

CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ships_updated_at BEFORE UPDATE ON ships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ship_equipment_updated_at BEFORE UPDATE ON ship_equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crew_members_updated_at BEFORE UPDATE ON crew_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON marketplace_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_offers_updated_at BEFORE UPDATE ON marketplace_offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_combat_sessions_updated_at BEFORE UPDATE ON combat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_combat_participants_updated_at BEFORE UPDATE ON combat_participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alliances_updated_at BEFORE UPDATE ON alliances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alliance_members_updated_at BEFORE UPDATE ON alliance_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON user_achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit trigger
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), OLD.user_id);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), NEW.user_id);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), NEW.user_id);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_resources_trigger
    AFTER INSERT OR UPDATE OR DELETE ON resources
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_transactions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_marketplace_listings_trigger
    AFTER INSERT OR UPDATE OR DELETE ON marketplace_listings
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create views for common queries
CREATE VIEW user_profile AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.level,
    u.experience,
    u.credits,
    u.avatar,
    u.title,
    u.status,
    u.created_at,
    u.last_login_at,
    us.total_play_time,
    us.battles_won,
    us.battles_lost,
    a.name as alliance_name,
    a.tag as alliance_tag,
    am.rank as alliance_rank
FROM users u
LEFT JOIN user_statistics us ON u.id = us.user_id
LEFT JOIN alliance_members am ON u.id = am.user_id
LEFT JOIN alliances a ON am.alliance_id = a.id
WHERE u.is_deleted = FALSE;

CREATE VIEW user_resources AS
SELECT 
    u.id as user_id,
    u.username,
    COALESCE(r.metal, 0) as metal,
    COALESCE(r.plasma, 0) as plasma,
    COALESCE(r.energy, 0) as energy,
    COALESCE(r.crystals, 0) as crystals,
    COALESCE(r.exotics, 0) as exotics,
    COALESCE(r.quantum, 0) as quantum,
    COALESCE(r.dark_matter, 0) as dark_matter,
    u.credits
FROM users u
LEFT JOIN LATERAL (
    SELECT 
        type,
        amount
    FROM resources r2 
    WHERE r2.user_id = u.id
) r ON true
WHERE u.is_deleted = FALSE;

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_user_last_active(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET last_active_at = NOW() 
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_user_level(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    current_exp BIGINT;
    new_level INTEGER;
BEGIN
    SELECT experience INTO current_exp FROM users WHERE id = user_uuid;
    
    -- Simple level calculation: 1000 XP per level
    new_level := GREATEST(1, FLOOR(current_exp / 1000));
    
    UPDATE users SET level = new_level WHERE id = user_uuid;
    
    RETURN new_level;
END;
$$ LANGUAGE plpgsql;
