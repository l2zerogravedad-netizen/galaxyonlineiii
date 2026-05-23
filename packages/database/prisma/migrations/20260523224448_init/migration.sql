-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" DATETIME,
    "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "empires" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "empires_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empire_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "capacity" INTEGER NOT NULL DEFAULT 1000,
    "production_per_hour" INTEGER NOT NULL DEFAULT 0,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "resources_empire_id_fkey" FOREIGN KEY ("empire_id") REFERENCES "empires" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "planets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empire_id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Planeta Principal',
    "galaxy_x" INTEGER NOT NULL DEFAULT 0,
    "galaxy_y" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'HABITABLE',
    "max_building_slots" INTEGER NOT NULL DEFAULT 9,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "planets_empire_id_fkey" FOREIGN KEY ("empire_id") REFERENCES "empires" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planet_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "slot_index" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "construction_ends_at" DATETIME,
    CONSTRAINT "buildings_planet_id_fkey" FOREIGN KEY ("planet_id") REFERENCES "planets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "technologies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "required_level" INTEGER NOT NULL DEFAULT 1,
    "cost_metal" INTEGER NOT NULL DEFAULT 0,
    "cost_plasma" INTEGER NOT NULL DEFAULT 0,
    "research_time" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "empire_technologies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empire_id" TEXT NOT NULL,
    "technology_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "research_ends_at" DATETIME,
    CONSTRAINT "empire_technologies_empire_id_fkey" FOREIGN KEY ("empire_id") REFERENCES "empires" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "empire_technologies_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technologies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "blueprints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "required_technology_id" TEXT,
    "cost_metal" INTEGER NOT NULL DEFAULT 0,
    "cost_plasma" INTEGER NOT NULL DEFAULT 0,
    "build_time" INTEGER NOT NULL DEFAULT 0,
    "attack" INTEGER NOT NULL DEFAULT 0,
    "hp" INTEGER NOT NULL DEFAULT 0,
    "defense" INTEGER NOT NULL DEFAULT 0,
    "speed" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "ships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empire_id" TEXT NOT NULL,
    "blueprint_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "fleet_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ships_empire_id_fkey" FOREIGN KEY ("empire_id") REFERENCES "empires" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ships_blueprint_id_fkey" FOREIGN KEY ("blueprint_id") REFERENCES "blueprints" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fleets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empire_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "total_power" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fleets_empire_id_fkey" FOREIGN KEY ("empire_id") REFERENCES "empires" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fleet_formations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fleet_id" TEXT NOT NULL,
    "slot_index" INTEGER NOT NULL,
    "ship_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "fleet_formations_fleet_id_fkey" FOREIGN KEY ("fleet_id") REFERENCES "fleets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "missions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "recommended_power" INTEGER NOT NULL,
    "enemy_fleet_config" TEXT NOT NULL,
    "reward_xp" INTEGER NOT NULL DEFAULT 0,
    "reward_credits" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "mission_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empire_id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "fleet_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME,
    CONSTRAINT "mission_runs_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "battles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empire_id" TEXT NOT NULL,
    "mission_run_id" TEXT,
    "fleet_id" TEXT NOT NULL,
    "result" TEXT,
    "rounds" TEXT,
    "seed" TEXT,
    "xp_gained" INTEGER NOT NULL DEFAULT 0,
    "credits_gained" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "battle_losses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "battle_id" TEXT NOT NULL,
    "blueprint_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "battle_losses_battle_id_fkey" FOREIGN KEY ("battle_id") REFERENCES "battles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "construction_queue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empire_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "target_planet_id" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" DATETIME NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "empires_user_id_key" ON "empires"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "resources_empire_id_type_key" ON "resources"("empire_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_planet_id_slot_index_key" ON "buildings"("planet_id", "slot_index");

-- CreateIndex
CREATE UNIQUE INDEX "empire_technologies_empire_id_technology_id_key" ON "empire_technologies"("empire_id", "technology_id");

-- CreateIndex
CREATE UNIQUE INDEX "fleet_formations_fleet_id_slot_index_key" ON "fleet_formations"("fleet_id", "slot_index");
