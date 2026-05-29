-- GO3 schema extension — ADDITIVE ONLY (safe for existing production data)
-- Adds the columns/tables the GO3 web routes (battles, galaxy, alliances, chat) require.
-- Every statement is IF NOT EXISTS / nullable / has a default, so it cannot drop or
-- invalidate existing rows. PostgreSQL dialect (production DB).

-- ── Battle: defender + updatedAt + fleet relation FK ─────────────────────────
ALTER TABLE "battles" ADD COLUMN IF NOT EXISTS "defender_id" TEXT;
ALTER TABLE "battles" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- FK battles.fleet_id -> fleets.id (relation added in schema). Guarded so re-runs are safe.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'battles_fleet_id_fkey' AND table_name = 'battles'
  ) THEN
    ALTER TABLE "battles"
      ADD CONSTRAINT "battles_fleet_id_fkey"
      FOREIGN KEY ("fleet_id") REFERENCES "fleets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- ── Blueprint: combat stats used by the web battle routes ────────────────────
ALTER TABLE "blueprints" ADD COLUMN IF NOT EXISTS "hull" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "blueprints" ADD COLUMN IF NOT EXISTS "shield" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "blueprints" ADD COLUMN IF NOT EXISTS "initiative" INTEGER NOT NULL DEFAULT 0;

-- ── Fleet: planet relation FK (galaxy move/planets routes) ───────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fleets_planet_id_fkey' AND table_name = 'fleets'
  ) THEN
    ALTER TABLE "fleets"
      ADD CONSTRAINT "fleets_planet_id_fkey"
      FOREIGN KEY ("planet_id") REFERENCES "planets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- ── AllianceMember: empire relation FK (alliances routes) ────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'alliance_members_empire_id_fkey' AND table_name = 'alliance_members'
  ) THEN
    ALTER TABLE "alliance_members"
      ADD CONSTRAINT "alliance_members_empire_id_fkey"
      FOREIGN KEY ("empire_id") REFERENCES "empires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- ── EmpireLog: new table for galaxy/move activity log ────────────────────────
CREATE TABLE IF NOT EXISTS "empire_logs" (
  "id"         TEXT NOT NULL,
  "empire_id"  TEXT NOT NULL,
  "type"       TEXT NOT NULL,
  "message"    TEXT NOT NULL,
  "metadata"   TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "empire_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "empire_logs_empire_id_idx" ON "empire_logs"("empire_id");
