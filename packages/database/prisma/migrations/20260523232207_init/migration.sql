/*
  Warnings:

  - Added the required column `key` to the `blueprints` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ship_constructions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empire_id" TEXT NOT NULL,
    "blueprint_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'BUILDING',
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" DATETIME NOT NULL,
    "completed_at" DATETIME,
    CONSTRAINT "ship_constructions_empire_id_fkey" FOREIGN KEY ("empire_id") REFERENCES "empires" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ship_constructions_blueprint_id_fkey" FOREIGN KEY ("blueprint_id") REFERENCES "blueprints" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_blueprints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'COMBAT',
    "required_technology_id" TEXT,
    "required_building_type" TEXT,
    "cost_metal" INTEGER NOT NULL DEFAULT 0,
    "cost_plasma" INTEGER NOT NULL DEFAULT 0,
    "cost_credits" INTEGER NOT NULL DEFAULT 0,
    "build_time" INTEGER NOT NULL DEFAULT 0,
    "attack" INTEGER NOT NULL DEFAULT 0,
    "hp" INTEGER NOT NULL DEFAULT 0,
    "defense" INTEGER NOT NULL DEFAULT 0,
    "speed" INTEGER NOT NULL DEFAULT 0,
    "cargo_capacity" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_blueprints" ("attack", "build_time", "cost_metal", "cost_plasma", "defense", "description", "hp", "id", "name", "required_technology_id", "speed", "type") SELECT "attack", "build_time", "cost_metal", "cost_plasma", "defense", "description", "hp", "id", "name", "required_technology_id", "speed", "type" FROM "blueprints";
DROP TABLE "blueprints";
ALTER TABLE "new_blueprints" RENAME TO "blueprints";
CREATE UNIQUE INDEX "blueprints_key_key" ON "blueprints"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
