'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import type { BuildingDefinition, GridSlot, PlayerData, ResourcesData } from '@/components/game/types';
import {
  buildOrUpgradeBuilding,
  loadDashboardData,
  mapDashboardToUi,
} from './gameClient';
import { getMockDashboardState } from './mapGameData';
import { isApiBuildable } from './buildingMap';

export interface GameDashboardState {
  player: PlayerData;
  resources: ResourcesData;
  planetId: string | null;
  planetName: string;
  planetType: string;
  grid: GridSlot[];
  buildings: BuildingDefinition[];
  usingMock: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  upgradeSelected: (params: {
    slotIndex: number;
    type: string;
    apiBuildingId?: string;
  }) => Promise<void>;
}

export function useGameDashboard(enabled: boolean): GameDashboardState {
  const mock = getMockDashboardState();
  const [player, setPlayer] = useState<PlayerData>(mock.player);
  const [resources, setResources] = useState<ResourcesData>(mock.resources);
  const [planetId, setPlanetId] = useState<string | null>(mock.planetId);
  const [planetName, setPlanetName] = useState(mock.planetName);
  const [planetType, setPlanetType] = useState(mock.planetType);
  const [grid, setGrid] = useState<GridSlot[]>(mock.grid);
  const [buildings, setBuildings] = useState<BuildingDefinition[]>(mock.buildings);
  const [usingMock, setUsingMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyDto = useCallback((dto: ReturnType<typeof mapDashboardToUi>) => {
    setPlayer(dto.player);
    setResources(dto.resources);
    setPlanetId(dto.planetId);
    setPlanetName(dto.planetName);
    setPlanetType(dto.planetType);
    setGrid(dto.grid);
    setBuildings(dto.buildings);
    setUsingMock(dto.usingMock);
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setError(null);
    try {
      const dto = await loadDashboardData();
      applyDto(mapDashboardToUi(dto));
      setUsingMock(false);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      const fallback = getMockDashboardState();
      applyDto(fallback);
      setUsingMock(true);
      setError(
        axios.isAxiosError(e)
          ? (e.response?.data as { error?: string })?.error ?? e.message
          : e instanceof Error
            ? e.message
            : 'No se pudo cargar el imperio'
      );
    } finally {
      setLoading(false);
    }
  }, [enabled, applyDto]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void refresh();
    const id = setInterval(() => void refresh(), 30000);
    return () => clearInterval(id);
  }, [enabled, refresh]);

  const upgradeSelected = useCallback(
    async (params: { slotIndex: number; type: string; apiBuildingId?: string }) => {
      if (!planetId || usingMock) return;
      if (!isApiBuildable(params.type)) {
        setError('Este edificio no está disponible en el servidor todavía.');
        return;
      }
      setError(null);
      try {
        await buildOrUpgradeBuilding(planetId, params.slotIndex, params.type);
        await refresh();
      } catch (e) {
        const msg =
          axiosErrorMessage(e) ?? 'No se pudo mejorar o construir el edificio';
        setError(msg);
        throw e;
      }
    },
    [planetId, usingMock, refresh]
  );

  return {
    player,
    resources,
    planetId,
    planetName,
    planetType,
    grid,
    buildings,
    usingMock,
    loading,
    error,
    refresh,
    upgradeSelected,
  };
}

function axiosErrorMessage(e: unknown): string | null {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const res = (e as { response?: { data?: { error?: string } } }).response;
    return res?.data?.error ?? null;
  }
  return null;
}
