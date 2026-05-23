/*
  Warnings:

  - You are about to drop the column `cost_metal` on the `technologies` table. All the data in the column will be lost.
  - You are about to drop the column `cost_plasma` on the `technologies` table. All the data in the column will be lost.
  - You are about to drop the column `required_level` on the `technologies` table. All the data in the column will be lost.
  - You are about to drop the column `research_time` on the `technologies` table. All the data in the column will be lost.
  - Added the required column `key` to the `technologies` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_empire_technologies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empire_id" TEXT NOT NULL,
    "technology_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "research_started_at" DATETIME,
    "research_ends_at" DATETIME,
    CONSTRAINT "empire_technologies_empire_id_fkey" FOREIGN KEY ("empire_id") REFERENCES "empires" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "empire_technologies_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technologies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_empire_technologies" ("empire_id", "id", "research_ends_at", "status", "technology_id") SELECT "empire_id", "id", "research_ends_at", "status", "technology_id" FROM "empire_technologies";
DROP TABLE "empire_technologies";
ALTER TABLE "new_empire_technologies" RENAME TO "empire_technologies";
CREATE UNIQUE INDEX "empire_technologies_empire_id_technology_id_key" ON "empire_technologies"("empire_id", "technology_id");
CREATE TABLE "new_technologies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "required_tech_id" TEXT,
    "base_cost_metal" INTEGER NOT NULL DEFAULT 100,
    "base_cost_plasma" INTEGER NOT NULL DEFAULT 50,
    "base_research_time" INTEGER NOT NULL DEFAULT 300,
    "max_level" INTEGER NOT NULL DEFAULT 5,
    "effect_type" TEXT,
    "effect_value" REAL NOT NULL DEFAULT 0,
    "effect_description" TEXT,
    CONSTRAINT "technologies_required_tech_id_fkey" FOREIGN KEY ("required_tech_id") REFERENCES "technologies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_technologies" ("description", "id", "name") SELECT "description", "id", "name" FROM "technologies";
DROP TABLE "technologies";
ALTER TABLE "new_technologies" RENAME TO "technologies";
CREATE UNIQUE INDEX "technologies_key_key" ON "technologies"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
