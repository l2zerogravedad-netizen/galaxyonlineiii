import axios from 'axios';
import '@/lib/apiBase';
import type { ApiEmpire, GameDashboardDto } from '@galaxy/shared';
import {
  dashboardToBuildings,
  dashboardToGrid,
  dashboardToPlayer,
  dashboardToResources,
} from './mapGameData';

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchGameDashboard(): Promise<GameDashboardDto> {
  const { data } = await axios.get<GameDashboardDto>('/api/game/dashboard', {
    headers: authHeaders(),
  });
  return data;
}

function empireToDashboard(empire: ApiEmpire): GameDashboardDto {
  const metal = empire.resources.find((r) => r.type === 'METAL');
  const plasma = empire.resources.find((r) => r.type === 'PLASMA');
  const credits = empire.resources.find((r) => r.type === 'CREDITS');
  const planet = empire.planets[0];

  return {
    player: {
      empireId: empire.id,
      name: empire.name,
      level: empire.level,
      xp: empire.experience,
      xpMax: Math.max(empire.level * 1000, 1000),
    },
    resources: {
      metal: metal?.amount ?? 0,
      plasma: plasma?.amount ?? 0,
      credits: credits?.amount ?? 0,
      metalCapacity: metal?.capacity ?? 0,
      plasmaCapacity: plasma?.capacity ?? 0,
      metalProduction: metal?.productionPerHour ?? 0,
      plasmaProduction: plasma?.productionPerHour ?? 0,
    },
    planet: {
      id: planet?.id ?? '',
      name: planet?.name ?? 'Planeta Principal',
      type: planet?.type ?? 'HABITABLE',
      maxBuildingSlots: planet?.maxBuildingSlots ?? 80,
      buildings: planet?.buildings ?? [],
    },
    constructionQueue: [],
  };
}

export async function loadDashboardData(): Promise<GameDashboardDto> {
  try {
    return await fetchGameDashboard();
  } catch {
    const { data } = await axios.get<ApiEmpire>('/api/empire', { headers: authHeaders() });
    return empireToDashboard(data);
  }
}

export function mapDashboardToUi(dto: GameDashboardDto) {
  return {
    player: dashboardToPlayer(dto),
    resources: dashboardToResources(dto),
    planetId: dto.planet.id || null,
    planetName: dto.planet.name,
    planetType: dto.planet.type,
    grid: dashboardToGrid(dto.planet),
    buildings: dashboardToBuildings(dto),
    constructionQueue: dto.constructionQueue ?? [],
    usingMock: false,
  };
}

export async function collectGameResources(): Promise<{
  resources: GameDashboardDto['resources'];
  collected: { metal: number; plasma: number; credits: number };
}> {
  const { data } = await axios.post(
    '/api/game/resources/collect',
    {},
    { headers: authHeaders() }
  );
  return data;
}

export async function buildOrUpgradeBuilding(
  planetId: string,
  slotIndex: number,
  type: string
): Promise<void> {
  await axios.post(
    `/api/planets/${planetId}/build`,
    { slotIndex, type },
    { headers: authHeaders() }
  );
}
