import { prisma } from '@/lib/prisma';

// ============================================================
// Helper: ensure commander_states table exists (raw SQL)
// This table stores gems, equipment, hospital state,
// stars and merge state per (empireId, commanderId).
// ============================================================

let tableChecked = false;

export async function ensureCommanderStatesTable(): Promise<void> {
  if (tableChecked) return;
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS commander_states (
      id            SERIAL PRIMARY KEY,
      empire_id     TEXT NOT NULL,
      commander_id  TEXT NOT NULL,
      gems          JSONB DEFAULT '{}'::jsonb,
      equipment     JSONB DEFAULT '{}'::jsonb,
      hospital      JSONB DEFAULT '{}'::jsonb,
      stars         INT DEFAULT 1,
      updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (empire_id, commander_id)
    )
  `;
  tableChecked = true;
}

// ---- GO2 GEM SLOTS (4 slots: red, blue, green, diamond) ----

export type Go2GemSlot = 'red' | 'blue' | 'green' | 'diamond';

export interface Go2GemData {
  gemId: string;
  slot: Go2GemSlot;
}

export interface Go2GemsPayload {
  slots: Record<Go2GemSlot, Go2GemData | null>;
}

export const GO2_GEM_SLOT_STATS: Record<Go2GemSlot, string> = {
  red: 'accuracy',
  blue: 'speed',
  green: 'dodge',
  diamond: 'electron',
};

export const GO2_GEM_BONUS_PER_SLOT = 10;

export const GO2_EMPTY_GEMS: Go2GemsPayload = {
  slots: { red: null, blue: null, green: null, diamond: null },
};

export async function getGo2Gems(
  empireId: string,
  commanderId: string
): Promise<Go2GemsPayload> {
  await ensureCommanderStatesTable();
  const rows = await prisma.$queryRaw<
    Array<{ gems: unknown }>
  >`
    SELECT gems FROM commander_states
    WHERE empire_id = ${empireId} AND commander_id = ${commanderId}
    LIMIT 1
  `;
  const saved = rows[0]?.gems;
  if (
    saved &&
    typeof saved === 'object' &&
    saved !== null &&
    'slots' in saved
  ) {
    const payload = saved as { slots: Record<string, unknown> };
    // Normalize: ensure all 4 slots exist
    return {
      slots: {
        red: (payload.slots.red ?? null) as Go2GemData | null,
        blue: (payload.slots.blue ?? null) as Go2GemData | null,
        green: (payload.slots.green ?? null) as Go2GemData | null,
        diamond: (payload.slots.diamond ?? null) as Go2GemData | null,
      },
    };
  }
  return { ...GO2_EMPTY_GEMS };
}

export async function setGo2Gems(
  empireId: string,
  commanderId: string,
  payload: Go2GemsPayload
): Promise<Go2GemsPayload> {
  await ensureCommanderStatesTable();
  await prisma.$executeRaw`
    INSERT INTO commander_states (empire_id, commander_id, gems, updated_at)
    VALUES (${empireId}, ${commanderId}, ${JSON.stringify(payload)}::jsonb, CURRENT_TIMESTAMP)
    ON CONFLICT (empire_id, commander_id)
    DO UPDATE SET gems = EXCLUDED.gems, updated_at = CURRENT_TIMESTAMP
  `;
  return payload;
}

// ---- LEGACY GEMS (3-slot system, keep for backward compat) ----

export interface GemData {
  id: string;
  type: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
  level: number;
  quality: 'normal' | 'refined' | 'perfect';
}

export interface GemsPayload {
  slots: (GemData | null)[];
}

export async function getGems(
  empireId: string,
  commanderId: string
): Promise<GemsPayload> {
  await ensureCommanderStatesTable();
  const rows = await prisma.$queryRaw<
    Array<{ gems: GemsPayload }>
  >`
    SELECT gems FROM commander_states
    WHERE empire_id = ${empireId} AND commander_id = ${commanderId}
    LIMIT 1
  `;
  const saved = rows[0]?.gems;
  if (saved && typeof saved === 'object' && 'slots' in saved) {
    return saved as GemsPayload;
  }
  return { slots: [null, null, null] };
}

export async function setGems(
  empireId: string,
  commanderId: string,
  payload: GemsPayload
): Promise<GemsPayload> {
  await ensureCommanderStatesTable();
  await prisma.$executeRaw`
    INSERT INTO commander_states (empire_id, commander_id, gems, updated_at)
    VALUES (${empireId}, ${commanderId}, ${JSON.stringify(payload)}::jsonb, CURRENT_TIMESTAMP)
    ON CONFLICT (empire_id, commander_id)
    DO UPDATE SET gems = EXCLUDED.gems, updated_at = CURRENT_TIMESTAMP
  `;
  return payload;
}

// ---- EQUIPMENT ---------------------------------------------

export interface EquipmentItemData {
  id: string;
  name: string;
  quality: 'S' | 'A' | 'B' | 'C' | 'D';
  icon: string;
  slotType: 'weapon' | 'defense';
}

export interface EquipmentPayload {
  weapons: (EquipmentItemData | null)[];
  defense: (EquipmentItemData | null)[];
}

export async function getEquipment(
  empireId: string,
  commanderId: string
): Promise<EquipmentPayload> {
  await ensureCommanderStatesTable();
  const rows = await prisma.$queryRaw<
    Array<{ equipment: EquipmentPayload }>
  >`
    SELECT equipment FROM commander_states
    WHERE empire_id = ${empireId} AND commander_id = ${commanderId}
    LIMIT 1
  `;
  const saved = rows[0]?.equipment;
  if (
    saved &&
    typeof saved === 'object' &&
    'weapons' in saved &&
    'defense' in saved
  ) {
    return saved as EquipmentPayload;
  }
  return {
    weapons: [null, null, null, null],
    defense: [null, null, null, null],
  };
}

export async function setEquipment(
  empireId: string,
  commanderId: string,
  payload: EquipmentPayload
): Promise<EquipmentPayload> {
  await ensureCommanderStatesTable();
  await prisma.$executeRaw`
    INSERT INTO commander_states (empire_id, commander_id, equipment, updated_at)
    VALUES (${empireId}, ${commanderId}, ${JSON.stringify(payload)}::jsonb, CURRENT_TIMESTAMP)
    ON CONFLICT (empire_id, commander_id)
    DO UPDATE SET equipment = EXCLUDED.equipment, updated_at = CURRENT_TIMESTAMP
  `;
  return payload;
}

// ---- HOSPITAL ----------------------------------------------

export interface HospitalPayload {
  status: 'HEALTHY' | 'INJURED' | 'RECOVERING';
  recoveryEndsAt: string | null; // ISO timestamp
  totalHealingTime: number; // seconds
  bedIndex: number | null;
}

export async function getHospital(
  empireId: string,
  commanderId: string
): Promise<HospitalPayload> {
  await ensureCommanderStatesTable();
  const rows = await prisma.$queryRaw<
    Array<{ hospital: HospitalPayload }>
  >`
    SELECT hospital FROM commander_states
    WHERE empire_id = ${empireId} AND commander_id = ${commanderId}
    LIMIT 1
  `;
  const saved = rows[0]?.hospital;
  if (saved && typeof saved === 'object' && 'status' in saved) {
    return saved as HospitalPayload;
  }
  return {
    status: 'HEALTHY',
    recoveryEndsAt: null,
    totalHealingTime: 0,
    bedIndex: null,
  };
}

export async function setHospital(
  empireId: string,
  commanderId: string,
  payload: HospitalPayload
): Promise<HospitalPayload> {
  await ensureCommanderStatesTable();
  await prisma.$executeRaw`
    INSERT INTO commander_states (empire_id, commander_id, hospital, updated_at)
    VALUES (${empireId}, ${commanderId}, ${JSON.stringify(payload)}::jsonb, CURRENT_TIMESTAMP)
    ON CONFLICT (empire_id, commander_id)
    DO UPDATE SET hospital = EXCLUDED.hospital, updated_at = CURRENT_TIMESTAMP
  `;
  return payload;
}

// ---- STARS (Merge system) ----------------------------------

export async function getStars(
  empireId: string,
  commanderId: string
): Promise<number> {
  await ensureCommanderStatesTable();
  const rows = await prisma.$queryRaw<
    Array<{ stars: number }>
  >`
    SELECT stars FROM commander_states
    WHERE empire_id = ${empireId} AND commander_id = ${commanderId}
    LIMIT 1
  `;
  return rows[0]?.stars ?? 1;
}

export async function setStars(
  empireId: string,
  commanderId: string,
  stars: number
): Promise<number> {
  await ensureCommanderStatesTable();
  await prisma.$executeRaw`
    INSERT INTO commander_states (empire_id, commander_id, stars, updated_at)
    VALUES (${empireId}, ${commanderId}, ${stars}, CURRENT_TIMESTAMP)
    ON CONFLICT (empire_id, commander_id)
    DO UPDATE SET stars = EXCLUDED.stars, updated_at = CURRENT_TIMESTAMP
  `;
  return stars;
}

// ---- COMMANDER OWNED CHECK ---------------------------------

export async function isCommanderOwned(
  empireId: string,
  commanderId: string
): Promise<boolean> {
  await ensureCommanderStatesTable();
  const rows = await prisma.$queryRaw<
    Array<{ count: number }>
  >`
    SELECT COUNT(*) as count FROM commander_states
    WHERE empire_id = ${empireId} AND commander_id = ${commanderId}
  `;
  const count = Number(rows[0]?.count ?? 0);
  return count > 0;
}

// Delete a commander state (for merge consumption)
export async function deleteCommanderState(
  empireId: string,
  commanderId: string
): Promise<void> {
  await ensureCommanderStatesTable();
  await prisma.$executeRaw`
    DELETE FROM commander_states
    WHERE empire_id = ${empireId} AND commander_id = ${commanderId}
  `;
}

// ---- Full state --------------------------------------------

export async function getFullState(
  empireId: string,
  commanderId: string
): Promise<{
  gems: GemsPayload;
  go2Gems: Go2GemsPayload;
  equipment: EquipmentPayload;
  hospital: HospitalPayload;
  stars: number;
}> {
  const [gems, go2Gems, equipment, hospital, stars] = await Promise.all([
    getGems(empireId, commanderId),
    getGo2Gems(empireId, commanderId),
    getEquipment(empireId, commanderId),
    getHospital(empireId, commanderId),
    getStars(empireId, commanderId),
  ]);
  return { gems, go2Gems, equipment, hospital, stars };
}
