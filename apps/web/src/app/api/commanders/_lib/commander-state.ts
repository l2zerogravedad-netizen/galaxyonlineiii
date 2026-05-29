import { prisma } from '@/lib/prisma';

// ============================================================
// Helper: ensure commander_states table exists (raw SQL)
// This table stores gems, equipment & hospital state per
// (empireId, commanderId) until Prisma schema is updated.
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
      updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (empire_id, commander_id)
    )
  `;
  tableChecked = true;
}

// ---- GEMS --------------------------------------------------

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

// ---- Merge (full state upsert) -----------------------------

export async function getFullState(
  empireId: string,
  commanderId: string
): Promise<{
  gems: GemsPayload;
  equipment: EquipmentPayload;
  hospital: HospitalPayload;
}> {
  const [gems, equipment, hospital] = await Promise.all([
    getGems(empireId, commanderId),
    getEquipment(empireId, commanderId),
    getHospital(empireId, commanderId),
  ]);
  return { gems, equipment, hospital };
}
