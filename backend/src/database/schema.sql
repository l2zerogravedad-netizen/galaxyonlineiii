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
-- ============================================================================
-- GALAXY ONLINE 2 - Sistema de Batalla Completo
-- Extension del schema base para soporte de combate MMO estilo GO2
-- ============================================================================
-- Este script agrega al schema existente:
--   - Nuevos tipos ENUM para el sistema de batalla (con manejo de duplicados)
--   - Columnas extendidas en combat_sessions (ALTER TABLE)
--   - 7 nuevas tablas para flotas, stacks, eventos, comandantes y disenos
--   - Indices optimizados para queries de batalla en tiempo real
--   - Triggers automaticos para updated_at
-- ============================================================================
-- REGLAS DEL SISTEMA DE BATALLA (confirmadas):
--   1. Orden de ataque: Por Speed individual del comandante (mayor primero)
--   2. Rondas: 20 rondas fijas (timeout = draw)
--   3. Escudos: Regeneran 100% entre rondas
--   4. He3: Sin He3 el stack no ataca (status = 'he3_depleted')
--   5. Perdida permanente: SOLO en PvP (pvp_destroyed)
--   6. Trial mode: NO como modo real, solo simulador dev
--   7. RNG: Determinista con seed reproducible + BattleLog completo
-- ============================================================================

-- =============================================================================
-- NUEVOS TIPOS ENUM PARA EL SISTEMA DE BATALLA
-- =============================================================================
-- PostgreSQL no soporta CREATE TYPE IF NOT EXISTS directamente.
-- Usamos bloques DO con manejo de excepcion duplicate_object.

DO $$
BEGIN
    CREATE TYPE formation_type AS ENUM ('wedge', 'line', 'shieldball', 'spearhead', 'diamond', 'scattered');
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE battle_result AS ENUM ('attacker_wins', 'defender_wins', 'timeout', 'draw');
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE stack_status AS ENUM ('alive', 'destroyed', 'he3_depleted');
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE event_type AS ENUM (
        'round_start', 'turn_start', 'attack', 'hit', 'miss', 'critical',
        'shield_damage', 'hull_damage', 'ships_destroyed', 'stack_destroyed',
        'he3_depleted', 'shield_regen', 'battle_end'
    );
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE loss_reason AS ENUM ('pvp_destroyed', 'pve_destroyed');
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE commander_status AS ENUM ('available', 'injured', 'hospital');
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE weapon_type AS ENUM ('ballistic', 'directional', 'missile', 'ship_based');
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;


-- =============================================================================
-- ALTER TABLE: EXTENSION DE combat_sessions EXISTENTE
-- =============================================================================
-- La tabla combat_sessions ya existe en el schema base.
-- Agregamos columnas nuevas para el sistema de batalla completo de GO2.

-- Seed del RNG para reproducibilidad completa de la batalla.
-- Con este seed se puede recrear el log exacto de cualquier batalla.
ALTER TABLE combat_sessions
    ADD COLUMN IF NOT EXISTS rng_seed BIGINT;

-- Estado serializado de todos los stacks vivos en formato JSONB.
-- Estructura: { stacks: [{ id, userId, slotPosition, currentHull, currentShield, currentShips, he3, status }] }
ALTER TABLE combat_sessions
    ADD COLUMN IF NOT EXISTS battle_state JSONB DEFAULT '{}';

-- Log completo de eventos serializado (cache para queries rapidas).
-- La fuente de verdad sigue siendo battle_events; este es un denormalizado.
ALTER TABLE combat_sessions
    ADD COLUMN IF NOT EXISTS battle_events JSONB DEFAULT '[]';

-- Ronda actual de la batalla (0 = preparacion, 1-20 = rondas de combate)
ALTER TABLE combat_sessions
    ADD COLUMN IF NOT EXISTS current_round INTEGER DEFAULT 0;

-- Maximo de rondas antes de timeout (GO2 = 20 rondas fijas)
ALTER TABLE combat_sessions
    ADD COLUMN IF NOT EXISTS max_rounds INTEGER DEFAULT 20;

-- Resultado final de la batalla despues de completarse
ALTER TABLE combat_sessions
    ADD COLUMN IF NOT EXISTS result battle_result;

-- Flota del atacante serializada (referencia a battle_fleets o inline)
ALTER TABLE combat_sessions
    ADD COLUMN IF NOT EXISTS attacker_fleet_id UUID;

-- Flota del defensor serializada
ALTER TABLE combat_sessions
    ADD COLUMN IF NOT EXISTS defender_fleet_id UUID;

-- Metadata del resumen: danio total, naves perdidas por lado, duracion real
ALTER TABLE combat_sessions
    ADD COLUMN IF NOT EXISTS battle_summary JSONB DEFAULT '{}';

-- Indice optimizado para busqueda de batallas activas por ronda
CREATE INDEX IF NOT EXISTS idx_combat_sessions_current_round ON combat_sessions(current_round);

-- Indice para busqueda de batallas por resultado (estadisticas)
CREATE INDEX IF NOT EXISTS idx_combat_sessions_result ON combat_sessions(result);

-- Indice para busqueda por tipo de batalla
CREATE INDEX IF NOT EXISTS idx_combat_sessions_battle_type ON combat_sessions(battle_type);

-- Comentarios descriptivos en las columnas nuevas
COMMENT ON COLUMN combat_sessions.rng_seed IS 'Seed del RNG para reproducibilidad determinista de la batalla';
COMMENT ON COLUMN combat_sessions.battle_state IS 'Estado serializado de todos los stacks (JSONB denormalizado para queries rapidas)';
COMMENT ON COLUMN combat_sessions.battle_events IS 'Log de eventos serializado (cache; fuente de verdad: battle_events)';
COMMENT ON COLUMN combat_sessions.current_round IS 'Ronda actual (0=preparacion, 1-20=combate)';
COMMENT ON COLUMN combat_sessions.max_rounds IS 'Maximo de rondas antes de timeout (GO2: 20 fijas)';
COMMENT ON COLUMN combat_sessions.result IS 'Resultado final: attacker_wins, defender_wins, timeout, draw';
COMMENT ON COLUMN combat_sessions.attacker_fleet_id IS 'Referencia a battle_fleets del atacante';
COMMENT ON COLUMN combat_sessions.defender_fleet_id IS 'Referencia a battle_fleets del defensor';
COMMENT ON COLUMN combat_sessions.battle_summary IS 'Resumen agregado: danio total, naves perdidas, duracion';


-- =============================================================================
-- TABLA 1: battle_fleets (Flotas de Batalla configurables por el jugador)
-- =============================================================================
-- Una flota tiene 9 slots. Cada slot puede contener un stack de naves con
-- comandante, diseno de nave, cantidad, armas y modulos.
-- El jugador configura estas flotas ANTES de la batalla.

CREATE TABLE IF NOT EXISTS battle_fleets (
    -- Identificador unico de la flota
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Jugador propietario de la flota
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Nombre descriptivo de la flota (ej: "Flota Principal", "Farm Team")
    name VARCHAR(100) DEFAULT 'Fleet',

    -- 9 slots para stacks de naves (cada slot es un JSONB auto-contenido)
    -- Estructura de cada slot:
    -- {
    --   commanderId: UUID,
    --   shipType: "fighter" | "cruiser" | "battleship" | ...,
    --   shipCount: integer (cantidad de naves en el stack),
    --   shipDesignId: string (referencia a battle_ship_designs.id),
    --   weapons: [{ type, damage, range, cooldown, he3Cost }],
    --   modules: [{ type, effect, value }]
    -- }
    slot_1 JSONB,
    slot_2 JSONB,
    slot_3 JSONB,
    slot_4 JSONB,
    slot_5 JSONB,
    slot_6 JSONB,
    slot_7 JSONB,
    slot_8 JSONB,
    slot_9 JSONB,

    -- Formacion tactica que afecta distribucion de danio
    formation formation_type DEFAULT 'wedge',

    -- Poder total calculado de la flota (para matchmaking y display)
    total_power INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice: flotas por usuario (listado de flotas del jugador)
CREATE INDEX IF NOT EXISTS idx_battle_fleets_user_id ON battle_fleets(user_id);

-- Indice: flotas ordenadas por poder (leaderboards, matchmaking)
CREATE INDEX IF NOT EXISTS idx_battle_fleets_total_power ON battle_fleets(total_power DESC);

COMMENT ON TABLE battle_fleets IS 'Flotas de batalla configurables por el jugador con 9 slots para stacks de naves';
COMMENT ON COLUMN battle_fleets.slot_1 IS 'Stack de naves en posicion 1 (JSONB con commanderId, shipType, shipCount, shipDesignId, weapons, modules)';
COMMENT ON COLUMN battle_fleets.formation IS 'Formacion tactica: wedge, line, shieldball, spearhead, diamond, scattered';
COMMENT ON COLUMN battle_fleets.total_power IS 'Poder total calculado para matchmaking y display';


-- =============================================================================
-- TABLA 2: battle_events (Log de Eventos de Batalla - tabla separada)
-- =============================================================================
-- Cada evento de la batalla se registra aqui: ataques, impactos, fallos,
-- criticos, danio a escudos, danio al casco, naves destruidas, regeneracion.
-- Esta tabla es la fuente de verdad del log; combat_sessions.battle_events es cache.
-- Separada por performance: miles de eventos por batalla, queries paginadas.

CREATE TABLE IF NOT EXISTS battle_events (
    -- Identificador unico del evento
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Batalla a la que pertenece este evento
    battle_id UUID NOT NULL REFERENCES combat_sessions(id) ON DELETE CASCADE,

    -- Numero de ronda en la que ocurrio (1-20)
    round INTEGER NOT NULL CHECK (round >= 1 AND round <= 20),

    -- Numero de turno dentro de la ronda (orden de ataque por speed)
    turn INTEGER NOT NULL CHECK (turn >= 1),

    -- Tipo de evento (round_start, attack, hit, miss, critical, etc.)
    event_type event_type NOT NULL,

    -- Stack que realiza la accion (atacante)
    -- NULL para eventos globales como round_start o battle_end
    attacker_stack_id UUID,

    -- Stack que recibe la accion (objetivo)
    -- NULL para eventos sin objetivo
    target_stack_id UUID,

    -- Danio bruto del ataque (antes de mitigaciones)
    damage INTEGER,

    -- Danio absorbido por escudos del objetivo
    shield_damage INTEGER,

    -- Danio directo al casco (despues de escudos)
    hull_damage INTEGER,

    -- Cantidad de naves individuales destruidas en este evento
    ships_lost INTEGER,

    -- Indica si fue un golpe critico (danio multiplicado)
    is_critical BOOLEAN DEFAULT FALSE,

    -- He3 consumido por el atacante para realizar esta accion
    he3_consumed INTEGER,

    -- He3 restante del atacante despues de la accion
    he3_remaining INTEGER,

    -- Mensaje legible para el cliente
    -- Ej: "[Ronda 3] Cruiser x50 ataca Battleship x20: 1500 danio, 500 escudo, 1000 casco"
    message TEXT NOT NULL,

    -- Timestamp de creacion del evento
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice principal: eventos por batalla (paginacion del log completo)
CREATE INDEX IF NOT EXISTS idx_battle_events_battle ON battle_events(battle_id);

-- Indice: eventos por batalla + ronda (reproduccion por ronda)
CREATE INDEX IF NOT EXISTS idx_battle_events_round ON battle_events(battle_id, round);

-- Indice: eventos por tipo (analisis de estadisticas)
CREATE INDEX IF NOT EXISTS idx_battle_events_type ON battle_events(event_type);

-- Indice: eventos por atacante (analisis de performance por stack)
CREATE INDEX IF NOT EXISTS idx_battle_events_attacker ON battle_events(attacker_stack_id);

-- Indice: eventos por objetivo (analisis de tankeo por stack)
CREATE INDEX IF NOT EXISTS idx_battle_events_target ON battle_events(target_stack_id);

COMMENT ON TABLE battle_events IS 'Log completo de eventos de batalla (fuente de verdad). Cada ataque, hit, miss, critico y destruccion se registra aqui.';
COMMENT ON COLUMN battle_events.battle_id IS 'Referencia a combat_sessions.id';
COMMENT ON COLUMN battle_events.round IS 'Ronda 1-20 del evento';
COMMENT ON COLUMN battle_events.turn IS 'Orden de turno dentro de la ronda (por speed)';
COMMENT ON COLUMN battle_events.event_type IS 'Tipo de evento: round_start, attack, hit, miss, critical, shield_damage, hull_damage, ships_destroyed, stack_destroyed, he3_depleted, shield_regen, battle_end';
COMMENT ON COLUMN battle_events.damage IS 'Danio bruto del ataque antes de mitigaciones';
COMMENT ON COLUMN battle_events.shield_damage IS 'Porcion del danio absorbida por escudos del objetivo';
COMMENT ON COLUMN battle_events.hull_damage IS 'Porcion del danio que impacto el casco directamente';
COMMENT ON COLUMN battle_events.ships_lost IS 'Naves individuales destruidas en este evento';
COMMENT ON COLUMN battle_events.is_critical IS 'True si fue golpe critico (multiplicador de danio)';
COMMENT ON COLUMN battle_events.he3_consumed IS 'He3 gastado por el atacante';
COMMENT ON COLUMN battle_events.he3_remaining IS 'He3 restante del atacante despues del turno';
COMMENT ON COLUMN battle_events.message IS 'Mensaje legible para el cliente/UI';


-- =============================================================================
-- TABLA 3: battle_stacks (Estado de cada Stack durante la Batalla)
-- =============================================================================
-- Cada stack es un grupo de naves del mismo tipo con un comandante, posicionado
-- en uno de los 9 slots de la flota. Esta tabla guarda el estado mutable DURANTE
-- la batalla: HP, escudos, He3, naves vivas, etc.
-- Se crea una fila por stack al iniciar la batalla (snapshot de la flota).

CREATE TABLE IF NOT EXISTS battle_stacks (
    -- Identificador unico del stack en esta batalla
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Batalla a la que pertenece
    battle_id UUID NOT NULL REFERENCES combat_sessions(id) ON DELETE CASCADE,

    -- Jugador propietario del stack
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Posicion en la flota (1-9)
    slot_position INTEGER NOT NULL CHECK (slot_position >= 1 AND slot_position <= 9),

    -- Comandante asignado a este stack (NULL = sin comandante, usa stats base)
    commander_id UUID,

    -- Tipo de nave (fighter, cruiser, battleship, carrier, frigate, destroyer...)
    -- Usa el ENUM ship_type ya existente en el schema
    ship_type ship_type NOT NULL,

    -- ID del diseno de nave (referencia a battle_ship_designs.id)
    -- Puede ser NULL si se usa un diseno por defecto
    ship_design_id VARCHAR(100) REFERENCES battle_ship_designs(id),

    -- Cantidad inicial de naves en el stack (al inicio de la batalla)
    initial_ship_count INTEGER NOT NULL CHECK (initial_ship_count > 0),

    -- Cantidad actual de naves vivas (decrece a medida que recibe danio)
    current_ship_count INTEGER NOT NULL CHECK (current_ship_count >= 0),

    -- Estructura (HP) de cada nave individual
    ship_structure INTEGER NOT NULL CHECK (ship_structure > 0),

    -- HP total del stack = ship_structure * current_ship_count (al inicio)
    total_hull INTEGER NOT NULL,

    -- HP actual del stack (disminuye con danio al casco)
    current_hull INTEGER NOT NULL,

    -- Escudo total del stack (al inicio de cada ronda, regenera 100%)
    total_shield INTEGER NOT NULL,

    -- Escudo actual (disminuye durante la ronda, se regenera entre rondas)
    current_shield INTEGER NOT NULL,

    -- Speed del comandante (determina orden de ataque; mayor = primero)
    speed INTEGER NOT NULL,

    -- Accuracy del comandante (afecta probabilidad de acierto)
    accuracy INTEGER NOT NULL,

    -- Dodge del comandante (afecta probabilidad de esquivar)
    dodge INTEGER NOT NULL,

    -- Electron del comandante (afecta mitigacion de danio)
    electron INTEGER NOT NULL,

    -- He3 actual del stack (combustible; sin He3 no puede atacar)
    he3_current INTEGER NOT NULL,

    -- He3 consumido por ronda de combate
    he3_per_round INTEGER NOT NULL,

    -- Armas equipadas en formato JSONB
    -- Estructura: [{ type: "ballistic", damage: 100, range: 3, cooldown: 1, he3Cost: 10 }]
    weapons JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Tipo de armadura (afecta resistencias)
    armor_type VARCHAR(50),

    -- Estado actual del stack: alive, destroyed, he3_depleted
    status stack_status DEFAULT 'alive',

    -- Timestamp de creacion del stack (inicio de batalla)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Timestamp de ultima actualizacion del estado (durante batalla)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice: stacks por batalla (listado completo de participantes)
CREATE INDEX IF NOT EXISTS idx_battle_stacks_battle ON battle_stacks(battle_id);

-- Indice: stacks por batalla + usuario (vista del jugador de sus stacks)
CREATE INDEX IF NOT EXISTS idx_battle_stacks_user ON battle_stacks(battle_id, user_id);

-- Indice: stacks por batalla + posicion (mapeo visual del grid 3x3)
CREATE INDEX IF NOT EXISTS idx_battle_stacks_position ON battle_stacks(battle_id, slot_position);

-- Indice: stacks vivos (para calcular turn order y condicion de victoria)
CREATE INDEX IF NOT EXISTS idx_battle_stacks_status ON battle_stacks(battle_id, status);

-- Indice: stacks por comandante (para estadisticas de comandantes)
CREATE INDEX IF NOT EXISTS idx_battle_stacks_commander ON battle_stacks(commander_id);

COMMENT ON TABLE battle_stacks IS 'Estado mutable de cada stack de naves durante una batalla. Snapshot creado al inicio, actualizado cada turno.';
COMMENT ON COLUMN battle_stacks.battle_id IS 'Referencia a combat_sessions.id';
COMMENT ON COLUMN battle_stacks.slot_position IS 'Posicion 1-9 en la formacion de la flota';
COMMENT ON COLUMN battle_stacks.commander_id IS 'Referencia a user_commanders.id (NULL = sin comandante)';
COMMENT ON COLUMN battle_stacks.ship_type IS 'Tipo de nave usando ENUM ship_type existente';
COMMENT ON COLUMN battle_stacks.ship_design_id IS 'Referencia a battle_ship_designs.id';
COMMENT ON COLUMN battle_stacks.initial_ship_count IS 'Naves al inicio de la batalla';
COMMENT ON COLUMN battle_stacks.current_ship_count IS 'Naves actualmente vivas (se reduce con danio)';
COMMENT ON COLUMN battle_stacks.ship_structure IS 'HP base de cada nave individual';
COMMENT ON COLUMN battle_stacks.total_hull IS 'HP total inicial del stack';
COMMENT ON COLUMN battle_stacks.current_hull IS 'HP actual del stack';
COMMENT ON COLUMN battle_stacks.total_shield IS 'Escudo total (regenera 100% entre rondas)';
COMMENT ON COLUMN battle_stacks.current_shield IS 'Escudo actual durante la ronda';
COMMENT ON COLUMN battle_stacks.speed IS 'Speed del comandante; determina orden de ataque';
COMMENT ON COLUMN battle_stacks.accuracy IS 'Accuracy del comandante; afecta hit chance';
COMMENT ON COLUMN battle_stacks.dodge IS 'Dodge del comandante; afecta evasion';
COMMENT ON COLUMN battle_stacks.electron IS 'Electron del comandante; afecta mitigacion de danio';
COMMENT ON COLUMN battle_stacks.he3_current IS 'He3 actual; si llega a 0 el stack no ataca';
COMMENT ON COLUMN battle_stacks.he3_per_round IS 'He3 consumido por ronda';
COMMENT ON COLUMN battle_stacks.weapons IS 'Armas del stack: [{ type, damage, range, cooldown, he3Cost }]';
COMMENT ON COLUMN battle_stacks.armor_type IS 'Tipo de armadura (afecta resistencias elementales)';
COMMENT ON COLUMN battle_stacks.status IS 'alive = activo, destroyed = destruido, he3_depleted = sin combustible';


-- =============================================================================
-- TABLA 4: fleet_losses (Perdidas Permanentes de Naves)
-- =============================================================================
-- En PvP las naves destruidas se pierden permanentemente.
-- Esta tabla registra cada perdida para auditoria, reembolso y estadisticas.
-- En PvE las naves NO se pierden (solo se registran para estadisticas).

CREATE TABLE IF NOT EXISTS fleet_losses (
    -- Identificador unico del registro de perdida
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Batalla en la que ocurrio la perdida
    battle_id UUID NOT NULL REFERENCES combat_sessions(id) ON DELETE CASCADE,

    -- Jugador que perdio las naves
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Tipo de nave perdida
    ship_type ship_type NOT NULL,

    -- ID del diseno de nave perdida
    ship_design_id VARCHAR(100),

    -- Cantidad de naves perdidas en esta entrada
    ships_lost INTEGER NOT NULL CHECK (ships_lost > 0),

    -- Razon de la perdida: pvp_destroyed (permanente) o pve_destroyed (solo stats)
    reason loss_reason NOT NULL,

    -- Timestamp del registro
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice: perdidas por batalla (resumen post-batalla)
CREATE INDEX IF NOT EXISTS idx_fleet_losses_battle ON fleet_losses(battle_id);

-- Indice: perdidas por usuario (historial de perdidas del jugador)
CREATE INDEX IF NOT EXISTS idx_fleet_losses_user ON fleet_losses(user_id);

-- Indice: perdidas por tipo de nave (analisis de meta)
CREATE INDEX IF NOT EXISTS idx_fleet_losses_ship ON fleet_losses(ship_type);

-- Indice: perdidas por razon (diferenciar PvP permanente vs PvE)
CREATE INDEX IF NOT EXISTS idx_fleet_losses_reason ON fleet_losses(reason);

-- Indice compuesto: perdidas del usuario por tipo (dashboard de perdidas)
CREATE INDEX IF NOT EXISTS idx_fleet_losses_user_ship ON fleet_losses(user_id, ship_type);

COMMENT ON TABLE fleet_losses IS 'Registro permanente de naves perdidas en batalla. PvP = perdida real, PvE = solo estadisticas.';
COMMENT ON COLUMN fleet_losses.battle_id IS 'Batalla donde ocurrio la perdida';
COMMENT ON COLUMN fleet_losses.user_id IS 'Jugador que perdio las naves';
COMMENT ON COLUMN fleet_losses.ship_type IS 'Tipo de nave usando ENUM ship_type';
COMMENT ON COLUMN fleet_losses.ship_design_id IS 'Diseno especifico de la nave perdida';
COMMENT ON COLUMN fleet_losses.ships_lost IS 'Cantidad de naves perdidas';
COMMENT ON COLUMN fleet_losses.reason IS 'pvp_destroyed = perdida permanente (PvP), pve_destroyed = solo stats (PvE)';


-- =============================================================================
-- TABLA 5: commander_cards (Catalogo de Comandantes ~100+)
-- =============================================================================
-- Catalogo maestro con todos los comandantes disponibles en el juego.
-- Cada comandante tiene stats base (accuracy, speed, dodge, electron) y
-- una clasificacion de experticia por tipo de arma (S, A, B, C grados).
-- Tambien tienen una habilidad especial unica.

CREATE TABLE IF NOT EXISTS commander_cards (
    -- Identificador unico del comandante
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Nombre del comandante (ej: "Eleni the Swift", "Admiral Kron")
    name VARCHAR(100) NOT NULL UNIQUE,

    -- Rareza usando el ENUM item_rarity ya existente
    rarity item_rarity NOT NULL,

    -- Accuracy base (afecta probabilidad de acertar ataques)
    base_accuracy INTEGER NOT NULL CHECK (base_accuracy >= 0),

    -- Speed base (determina orden de ataque en la ronda; mayor = primero)
    base_speed INTEGER NOT NULL CHECK (base_speed >= 0),

    -- Dodge base (afecta probabilidad de esquivar ataques)
    base_dodge INTEGER NOT NULL CHECK (base_dodge >= 0),

    -- Electron base (afecta mitigacion de danio recibido)
    base_electron INTEGER NOT NULL CHECK (base_electron >= 0),

    -- Experticia por tipo de arma (grados S, A, B, C como en Galaxy Online 2)
    -- Estructura: { ballistic: "S", directional: "A", missile: "B", ship_based: "C" }
    -- Grados: S=Superior (120%), A=Advanced (110%), B=Basic (100%), C=Crippled (90%)
    expertise JSONB NOT NULL DEFAULT '{
        "ballistic": "B",
        "directional": "B",
        "missile": "B",
        "ship_based": "B"
    }'::jsonb,

    -- Nombre de la habilidad especial (ej: "Precision Shot", "Shield Overload")
    skill_name VARCHAR(100),

    -- Descripcion legible de la habilidad
    skill_description TEXT,

    -- Efecto de la habilidad en formato JSONB
    -- Estructura: { type: "damage_boost", value: 1.25, trigger: "on_attack", target: "ballistic" }
    skill_effect JSONB,

    -- URL del portrait/avatar del comandante
    portrait_url VARCHAR(500),

    -- Lore/descripcion del trasfondo del personaje
    lore TEXT,

    -- Timestamp de creacion
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice: comandantes por rareza (filtrado en UI de reclutamiento)
CREATE INDEX IF NOT EXISTS idx_commander_cards_rarity ON commander_cards(rarity);

-- Indice GIN: busqueda por experticia (ej: todos con expertise ballistic = "S")
CREATE INDEX IF NOT EXISTS idx_commander_cards_expertise ON commander_cards USING GIN(expertise);

COMMENT ON TABLE commander_cards IS 'Catalogo maestro de comandantes (~100+). Stats base, experticia por tipo de arma y habilidad especial.';
COMMENT ON COLUMN commander_cards.name IS 'Nombre unico del comandante';
COMMENT ON COLUMN commander_cards.rarity IS 'Rareza usando ENUM item_rarity: common, uncommon, rare, epic, legendary, mythic';
COMMENT ON COLUMN commander_cards.base_accuracy IS 'Accuracy base: afecta hit chance';
COMMENT ON COLUMN commander_cards.base_speed IS 'Speed base: mayor = ataca primero en la ronda';
COMMENT ON COLUMN commander_cards.base_dodge IS 'Dodge base: afecta evasion de ataques';
COMMENT ON COLUMN commander_cards.base_electron IS 'Electron base: afecta mitigacion de danio';
COMMENT ON COLUMN commander_cards.expertise IS 'Experticia por tipo de arma: { ballistic, directional, missile, ship_based } con grados S/A/B/C';
COMMENT ON COLUMN commander_cards.skill_name IS 'Nombre de la habilidad especial del comandante';
COMMENT ON COLUMN commander_cards.skill_description IS 'Descripcion legible de la habilidad';
COMMENT ON COLUMN commander_cards.skill_effect IS 'Efecto parseable: { type, value, trigger, target }';
COMMENT ON COLUMN commander_cards.portrait_url IS 'URL del portrait del comandante';
COMMENT ON COLUMN commander_cards.lore IS 'Trasfondo/lore del personaje';


-- =============================================================================
-- TABLA 6: user_commanders (Comandantes Poseidos por el Usuario)
-- =============================================================================
-- Cada jugador puede poseer multiples copias de comandantes (gacha/drops).
-- Los comandantes suben de nivel, ganan estrellas, y equipan gemas.
-- Pueden estar asignados a un slot de flota (1-9) o disponibles.

CREATE TABLE IF NOT EXISTS user_commanders (
    -- Identificador unico de la instancia del comandante del usuario
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Jugador propietario
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Referencia al comandante base (catalogo)
    commander_id UUID NOT NULL REFERENCES commander_cards(id) ON DELETE CASCADE,

    -- Nivel actual del comandante (afecta stats: accuracy, speed, dodge, electron)
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),

    -- Experiencia acumulada para el siguiente nivel
    experience INTEGER DEFAULT 0,

    -- Estrellas (1-6, afecta multiplicador de stats y desbloquea skills)
    stars INTEGER DEFAULT 1 CHECK (stars >= 1 AND stars <= 6),

    -- Gemas equipadas (slot rojo, azul, verde, diamante)
    -- Estructura: { red: gemId, blue: gemId, green: gemId, diamond: gemId }
    equipped_gems JSONB DEFAULT '{
        "red": null,
        "blue": null,
        "green": null,
        "diamond": null
    }'::jsonb,

    -- Slot de flota asignado (1-9), NULL si no esta asignado a ninguna flota
    assigned_fleet_slot INTEGER CHECK (assigned_fleet_slot >= 1 AND assigned_fleet_slot <= 9),

    -- Estado del comandante: available, injured (herido post-batalla), hospital (recuperandose)
    status commander_status DEFAULT 'available',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Un usuario no puede tener duplicados del mismo comandante
    UNIQUE(user_id, commander_id)
);

-- Indice: comandantes del usuario (listado completo)
CREATE INDEX IF NOT EXISTS idx_user_commanders_user ON user_commanders(user_id);

-- Indice: comandantes por comandante base (busqueda de usuarios con un comandante especifico)
CREATE INDEX IF NOT EXISTS idx_user_commanders_commander ON user_commanders(commander_id);

-- Indice: comandantes disponibles (para asignacion rapida a flotas)
CREATE INDEX IF NOT EXISTS idx_user_commanders_status ON user_commanders(user_id, status);

-- Indice: comandantes asignados a flotas (para validacion de slots unicos)
CREATE INDEX IF NOT EXISTS idx_user_commanders_fleet_slot ON user_commanders(user_id, assigned_fleet_slot);

COMMENT ON TABLE user_commanders IS 'Instancias de comandantes poseidos por cada jugador. Nivel, estrellas, gemas y asignacion a flotas.';
COMMENT ON COLUMN user_commanders.user_id IS 'Jugador propietario';
COMMENT ON COLUMN user_commanders.commander_id IS 'Referencia a commander_cards (catalogo base)';
COMMENT ON COLUMN user_commanders.level IS 'Nivel 1-100, afecta stats';
COMMENT ON COLUMN user_commanders.experience IS 'XP acumulada para subir de nivel';
COMMENT ON COLUMN user_commanders.stars IS 'Estrellas 1-6, afecta multiplicador de stats y skills';
COMMENT ON COLUMN user_commanders.equipped_gems IS 'Gemas equipadas: { red, blue, green, diamond }';
COMMENT ON COLUMN user_commanders.assigned_fleet_slot IS 'Slot 1-9 de la flota asignada, NULL si libre';
COMMENT ON COLUMN user_commanders.status IS 'available = listo, injured = herido, hospital = recuperandose';


-- =============================================================================
-- TABLA 7: battle_ship_designs (Disenos de Naves para Batalla)
-- =============================================================================
-- Catalogo de todos los disenos de naves disponibles en el juego.
-- Cada diseno define stats base, slots de armas/modulos, consumo de He3 y costo.
-- Los jugadores desbloquean disenos via investigacion o blueprints.

CREATE TABLE IF NOT EXISTS battle_ship_designs (
    -- ID del diseno (string legible, ej: "tiamat_mk2", "shadow_guardian")
    id VARCHAR(100) PRIMARY KEY,

    -- Nombre descriptivo (ej: "Tiamat Mk.II", "Shadow Guardian")
    name VARCHAR(100) NOT NULL,

    -- Clase de nave usando ENUM ship_class existente (light, medium, heavy, capital)
    ship_class ship_class NOT NULL,

    -- Poder de ataque base
    attack INTEGER NOT NULL CHECK (attack >= 0),

    -- Defensa base (reduccion de danio)
    defense INTEGER NOT NULL CHECK (defense >= 0),

    -- Estructura/HP base por nave
    structure INTEGER NOT NULL CHECK (structure > 0),

    -- Escudo base por nave
    shield INTEGER NOT NULL CHECK (shield >= 0),

    -- Speed base (afecta orden de ataque si no hay comandante)
    speed INTEGER NOT NULL CHECK (speed >= 0),

    -- Factor de estabilidad (multiplicador de stats: 0.50 a 2.00)
    -- Mayor estabilidad = stats mas consistentes, menor = mas RNG
    stability DECIMAL(3,2) NOT NULL DEFAULT 1.00 CHECK (stability >= 0.50 AND stability <= 2.00),

    -- Slots de armas disponibles (maximo de armas equipables)
    weapon_slots INTEGER DEFAULT 3 CHECK (weapon_slots >= 0 AND weapon_slots <= 10),

    -- Slots de modulos disponibles (maximo de modulos equipables)
    module_slots INTEGER DEFAULT 3 CHECK (module_slots >= 0 AND module_slots <= 10),

    -- Consumo base de He3 por ronda de combate
    base_he3_consumption INTEGER NOT NULL CHECK (base_he3_consumption >= 0),

    -- Costo de construccion en recursos
    -- Estructura: { metal: 1000, plasma: 500, energy: 200 }
    build_cost JSONB NOT NULL DEFAULT '{
        "metal": 0,
        "plasma": 0,
        "energy": 0
    }'::jsonb,

    -- Tiempo de construccion en segundos
    build_time INTEGER NOT NULL CHECK (build_time >= 0),

    -- Rareza del diseno usando ENUM item_rarity existente
    rarity item_rarity DEFAULT 'common',

    -- ID de la investigacion requerida para desbloquear (NULL = disponible por defecto)
    required_research VARCHAR(100),

    -- Si requiere blueprint para construir (naves premium/evento)
    is_blueprint BOOLEAN DEFAULT FALSE,

    -- Timestamp de creacion del registro
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice: disenos por clase (filtrado en UI de construccion)
CREATE INDEX IF NOT EXISTS idx_battle_ship_designs_class ON battle_ship_designs(ship_class);

-- Indice: disenos por rareza (filtrado en catalogo)
CREATE INDEX IF NOT EXISTS idx_battle_ship_designs_rarity ON battle_ship_designs(rarity);

-- Indice: disenos por investigacion requerida (arbol de tecnologia)
CREATE INDEX IF NOT EXISTS idx_battle_ship_designs_research ON battle_ship_designs(required_research);

-- Indice: disenos que requieren blueprint (filtrado de premium)
CREATE INDEX IF NOT EXISTS idx_battle_ship_designs_blueprint ON battle_ship_designs(is_blueprint);

-- Indice GIN: busqueda por costo de construccion (planificador de recursos)
CREATE INDEX IF NOT EXISTS idx_battle_ship_designs_build_cost ON battle_ship_designs USING GIN(build_cost);

COMMENT ON TABLE battle_ship_designs IS 'Catalogo de disenos de naves para el sistema de batalla. Stats base, slots, consumo He3 y costos.';
COMMENT ON COLUMN battle_ship_designs.id IS 'ID legible del diseno (ej: tiamat_mk2)';
COMMENT ON COLUMN battle_ship_designs.name IS 'Nombre descriptivo del diseno';
COMMENT ON COLUMN battle_ship_designs.ship_class IS 'Clase usando ENUM ship_class: light, medium, heavy, capital';
COMMENT ON COLUMN battle_ship_designs.attack IS 'Poder de ataque base';
COMMENT ON COLUMN battle_ship_designs.defense IS 'Defensa base (reduccion de danio)';
COMMENT ON COLUMN battle_ship_designs.structure IS 'HP base por nave individual';
COMMENT ON COLUMN battle_ship_designs.shield IS 'Escudo base por nave individual';
COMMENT ON COLUMN battle_ship_designs.speed IS 'Speed base (afecta orden si no hay comandante)';
COMMENT ON COLUMN battle_ship_designs.stability IS 'Factor 0.50-2.00: multiplicador de stats';
COMMENT ON COLUMN battle_ship_designs.weapon_slots IS 'Slots de armas disponibles (0-10)';
COMMENT ON COLUMN battle_ship_designs.module_slots IS 'Slots de modulos disponibles (0-10)';
COMMENT ON COLUMN battle_ship_designs.base_he3_consumption IS 'He3 consumido por ronda de combate';
COMMENT ON COLUMN battle_ship_designs.build_cost IS 'Costo en recursos: { metal, plasma, energy }';
COMMENT ON COLUMN battle_ship_designs.build_time IS 'Tiempo de construccion en segundos';
COMMENT ON COLUMN battle_ship_designs.rarity IS 'Rareza usando ENUM item_rarity';
COMMENT ON COLUMN battle_ship_designs.required_research IS 'ID de investigacion para desbloquear (NULL = libre)';
COMMENT ON COLUMN battle_ship_designs.is_blueprint IS 'TRUE si requiere blueprint para construir';


-- =============================================================================
-- TRIGGERS updated_at PARA NUEVAS TABLAS
-- =============================================================================
-- PostgreSQL no soporta CREATE TRIGGER IF NOT EXISTS.
-- Usamos DROP TRIGGER IF EXISTS + CREATE TRIGGER.

-- battle_fleets
DROP TRIGGER IF EXISTS update_battle_fleets_updated_at ON battle_fleets;
CREATE TRIGGER update_battle_fleets_updated_at
    BEFORE UPDATE ON battle_fleets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- battle_stacks (actualizado cada turno durante la batalla)
DROP TRIGGER IF EXISTS update_battle_stacks_updated_at ON battle_stacks;
CREATE TRIGGER update_battle_stacks_updated_at
    BEFORE UPDATE ON battle_stacks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- commander_cards (actualizado por administradores/devs)
DROP TRIGGER IF EXISTS update_commander_cards_updated_at ON commander_cards;
CREATE TRIGGER update_commander_cards_updated_at
    BEFORE UPDATE ON commander_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- user_commanders (actualizado frecuentemente: nivel, estrellas, gemas, estado)
DROP TRIGGER IF EXISTS update_user_commanders_updated_at ON user_commanders;
CREATE TRIGGER update_user_commanders_updated_at
    BEFORE UPDATE ON user_commanders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- battle_ship_designs (actualizado por administradores/devs)
DROP TRIGGER IF EXISTS update_battle_ship_designs_updated_at ON battle_ship_designs;
CREATE TRIGGER update_battle_ship_designs_updated_at
    BEFORE UPDATE ON battle_ship_designs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =============================================================================
-- VISTAS AUXILIARES PARA QUERIES COMUNES DE BATALLA
-- =============================================================================

-- Vista: resumen de batalla con estadisticas agregadas por usuario
-- Uso: pantalla de resultados post-batalla, historial de batallas
CREATE OR REPLACE VIEW battle_summary AS
SELECT
    cs.id AS battle_id,
    cs.battle_type,
    cs.result,
    cs.current_round AS rounds_played,
    cs.start_time,
    cs.end_time,
    EXTRACT(EPOCH FROM (cs.end_time - cs.start_time)) AS duration_seconds,
    cs.rng_seed,
    cs.battle_summary AS raw_summary,
    -- Agregacion de stacks por usuario
    (
        SELECT jsonb_agg(jsonb_build_object(
            'user_id', bs.user_id,
            'slot_position', bs.slot_position,
            'ship_type', bs.ship_type,
            'initial_ships', bs.initial_ship_count,
            'remaining_ships', bs.current_ship_count,
            'ships_lost', bs.initial_ship_count - bs.current_ship_count,
            'status', bs.status
        ) ORDER BY bs.slot_position)
        FROM battle_stacks bs
        WHERE bs.battle_id = cs.id
    ) AS stacks_state,
    -- Perdidas permanentes (solo PvP)
    (
        SELECT COALESCE(SUM(fl.ships_lost), 0)
        FROM fleet_losses fl
        WHERE fl.battle_id = cs.id AND fl.reason = 'pvp_destroyed'
    ) AS total_pvp_losses
FROM combat_sessions cs
WHERE cs.status = 'completed'
ORDER BY cs.end_time DESC;

COMMENT ON VIEW battle_summary IS 'Resumen agregado de batallas completadas con estadisticas por usuario y perdidas';


-- =============================================================================
-- FUNCIONES AUXILIARES PARA EL SISTEMA DE BATALLA
-- =============================================================================

-- Funcion: Obtener el orden de ataque (turn order) para una batalla y ronda
-- Los stacks se ordenan por speed DESC. En empate, el slot_position menor va primero.
-- Uso: engine de batalla llama esto al inicio de cada ronda.
CREATE OR REPLACE FUNCTION get_turn_order(p_battle_id UUID, p_round INTEGER)
RETURNS TABLE (
    stack_id UUID,
    stack_user_id UUID,
    stack_slot_position INTEGER,
    stack_speed INTEGER,
    stack_ship_type ship_type,
    stack_status stack_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bs.id,
        bs.user_id,
        bs.slot_position,
        bs.speed,
        bs.ship_type,
        bs.status
    FROM battle_stacks bs
    WHERE bs.battle_id = p_battle_id
      AND bs.status = 'alive'          -- Solo stacks vivos
      AND bs.he3_current > 0           -- Solo stacks con He3
    ORDER BY bs.speed DESC, bs.slot_position ASC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_turn_order(UUID, INTEGER) IS 'Devuelve el orden de ataque para una ronda: por speed DESC, slot_position ASC como desempate. Solo stacks vivos con He3.';

-- Funcion: Verificar si la batalla ha terminado (condicion de victoria)
-- La batalla termina cuando un lado tiene 0 stacks vivos, o se alcanza max_rounds.
-- Uso: engine de batalla verifica despues de cada evento.
-- NOTA: Asume 2 participantes. Para mas jugadores, extender la logica.
CREATE OR REPLACE FUNCTION check_battle_end(p_battle_id UUID)
RETURNS battle_result AS $$
DECLARE
    v_side_a_alive INTEGER;
    v_side_b_alive INTEGER;
    v_current_round INTEGER;
    v_max_rounds INTEGER;
    v_result battle_result;
BEGIN
    -- Obtener estado actual de la batalla
    SELECT cs.current_round, cs.max_rounds
    INTO v_current_round, v_max_rounds
    FROM combat_sessions cs
    WHERE cs.id = p_battle_id;

    -- Contar stacks vivos por lado usando ROW_NUMBER para separar participantes
    -- Asume maximo 2 participantes por batalla (attacker = 1, defender = 2)
    WITH sides AS (
        SELECT DISTINCT user_id,
               ROW_NUMBER() OVER (ORDER BY MIN(created_at)) as side_num
        FROM battle_stacks
        WHERE battle_id = p_battle_id
        GROUP BY user_id
    )
    SELECT
        COUNT(*) FILTER (WHERE bs.status = 'alive' AND s.side_num = 1),
        COUNT(*) FILTER (WHERE bs.status = 'alive' AND s.side_num = 2)
    INTO v_side_a_alive, v_side_b_alive
    FROM battle_stacks bs
    JOIN sides s ON bs.user_id = s.user_id
    WHERE bs.battle_id = p_battle_id;

    -- Determinar resultado
    IF v_side_a_alive = 0 AND v_side_b_alive = 0 THEN
        v_result := 'draw';
    ELSIF v_side_a_alive = 0 THEN
        v_result := 'defender_wins';
    ELSIF v_side_b_alive = 0 THEN
        v_result := 'attacker_wins';
    ELSIF v_current_round >= v_max_rounds THEN
        v_result := 'timeout';
    ELSE
        v_result := NULL; -- Batalla continua
    END IF;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION check_battle_end(UUID) IS 'Verifica condiciones de victoria: attacker_wins, defender_wins, timeout, draw, o NULL si continua. Asume 2 participantes.';

-- Funcion: Calcular poder total de una flota (para matchmaking y display)
-- Suma el poder calculado de cada slot basado en ship_design, count y comandante.
-- Nota: Esta funcion es una aproximacion. El engine de batalla usa logica mas compleja.
CREATE OR REPLACE FUNCTION calculate_fleet_power(p_fleet_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_fleet RECORD;
    v_slots JSONB[];
    v_slot JSONB;
    v_slot_idx INTEGER;
    v_power INTEGER := 0;
    v_slot_power NUMERIC;
    v_design RECORD;
    v_commander RECORD;
    v_ship_count INTEGER;
    v_ship_design_id TEXT;
    v_commander_id TEXT;
BEGIN
    SELECT * INTO v_fleet FROM battle_fleets WHERE id = p_fleet_id;
    IF v_fleet IS NULL THEN
        RETURN 0;
    END IF;

    -- Cargar los 9 slots en un array
    v_slots := ARRAY[
        v_fleet.slot_1, v_fleet.slot_2, v_fleet.slot_3,
        v_fleet.slot_4, v_fleet.slot_5, v_fleet.slot_6,
        v_fleet.slot_7, v_fleet.slot_8, v_fleet.slot_9
    ];

    -- Iterar sobre los 9 slots
    FOR v_slot_idx IN 1..9 LOOP
        v_slot := v_slots[v_slot_idx];

        IF v_slot IS NOT NULL AND v_slot ? 'shipDesignId' THEN
            v_ship_design_id := v_slot->>'shipDesignId';
            v_ship_count := COALESCE((v_slot->>'shipCount')::INTEGER, 1);
            v_commander_id := v_slot->>'commanderId';

            -- Obtener stats del diseno
            SELECT * INTO v_design
            FROM battle_ship_designs
            WHERE id = v_ship_design_id;

            IF v_design IS NOT NULL THEN
                -- Poder base: suma de stats * cantidad * estabilidad
                v_slot_power := (
                    (v_design.attack + v_design.defense + v_design.structure + v_design.shield + v_design.speed)
                    * v_ship_count
                    * v_design.stability
                );

                -- Bonus del comandante si existe
                IF v_commander_id IS NOT NULL AND v_commander_id <> '' THEN
                    BEGIN
                        SELECT cc.base_accuracy, cc.base_speed, cc.base_dodge, cc.base_electron
                        INTO v_commander
                        FROM commander_cards cc
                        JOIN user_commanders uc ON cc.id = uc.commander_id
                        WHERE uc.id = v_commander_id::UUID;

                        IF v_commander IS NOT NULL THEN
                            v_slot_power := v_slot_power * (100.0 + v_commander.base_speed + v_commander.base_accuracy) / 100.0;
                        END IF;
                    EXCEPTION WHEN OTHERS THEN
                        -- Si el comandante no se encuentra, ignorar bonus
                        NULL;
                    END;
                END IF;

                v_power := v_power + v_slot_power::INTEGER;
            END IF;
        END IF;
    END LOOP;

    -- Actualizar el poder en la tabla
    UPDATE battle_fleets SET total_power = v_power WHERE id = p_fleet_id;

    RETURN v_power;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_fleet_power(UUID) IS 'Calcula y actualiza el poder total de una flota sumando stats de naves, count y bonus de comandante';


-- =============================================================================
-- FIN DEL SCRIPT DE EXTENSION DEL SISTEMA DE BATALLA
-- =============================================================================
-- Tablas creadas:     7 (battle_fleets, battle_events, battle_stacks,
--                        fleet_losses, commander_cards, user_commanders,
--                        battle_ship_designs)
-- Tablas alteradas:   1 (combat_sessions + 8 columnas nuevas)
-- ENUMs creados:     7 (formation_type, battle_result, stack_status,
--                        event_type, loss_reason, commander_status, weapon_type)
-- Indices creados:   30+
-- Triggers creados:  5 (updated_at para tablas mutables)
-- Vistas creadas:    1 (battle_summary)
-- Funciones creadas: 3 (get_turn_order, check_battle_end, calculate_fleet_power)
-- =============================================================================
