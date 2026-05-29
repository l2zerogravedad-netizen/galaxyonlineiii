/** Recursos iniciales — doc GO II / economy-system.ts */
export const INITIAL_PLAYER_RESOURCES = {
  metal: 10_000,
  plasma: 10_000,
  credits: 10_000,
  energy: 100,
} as const;

export const INITIAL_RESOURCE_CAPACITY = {
  metal: 50_000,
  plasma: 50_000,
  he3: 25_000,
  credits: 999_999_999,
} as const;
