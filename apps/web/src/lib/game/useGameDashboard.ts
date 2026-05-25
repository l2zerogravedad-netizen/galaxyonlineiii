'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import type { Go2ConstructionQueueItemDto } from '@galaxy/shared';
import type { BuildingDefinition, GridSlot, PlayerData, ResourcesData } from '@/components/game/types';
import {
  buildOrUpgradeBuilding,
  collectGameResources,
  loadDashboardData,
  mapDashboardToUi,
} from './gameClient';
import { getMockDashboardState } from './mapGameData';
import { isApiBuildable } from './buildingMap';
import { CATALOG_ID_TO_TYPE } from './buildingMap';

export interface GameDashboardState {
  player: PlayerData;
  resources: ResourcesData;
  planetId: string | null;
  planetName: string;
  planetType: string;
  grid: GridSlot[];
  buildings: BuildingDefinition[];
  constructionQueue: Go2ConstructionQueueItemDto[];
  usingMock: boolean;
  loading: boolean;
  error: string | null;
  actionToast: string | null;
  showToast: (message: string) => void;
  collectResources: () => Promise<void>;
  refresh: () => Promise<void>;
  upgradeSelected: (params: {
    slotIndex: number;
    type: string;
    apiBuildingId?: string;
    catalogId?: string;
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
  const [constructionQueue, setConstructionQueue] = useState<Go2ConstructionQueueItemDto[]>([]);
  const [usingMock, setUsingMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setActionToast(message);
    window.setTimeout(() => setActionToast(null), 2800);
  }, []);

  const applyDto = useCallback((dto: ReturnType<typeof mapDashboardToUi>) => {
    setPlayer(dto.player);
    setResources(dto.resources);
    setPlanetId(dto.planetId);
    setPlanetName(dto.planetName);
    setPlanetType(dto.planetType);
    setGrid(dto.grid);
    setBuildings(dto.buildings);
    setConstructionQueue(dto.constructionQueue);
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
      applyDto(getMockDashboardState());
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
    const id = setInterval(() => void refresh(), 5_000);
    return () => clearInterval(id);
  }, [enabled, refresh]);

  const collectResources = useCallback(async () => {
    if (usingMock) {
      showToast('Modo demo — inicia sesión');
      return;
    }
    try {
      const result = await collectGameResources();
      setResources({
        metal: result.resources.metal,
        plasma: result.resources.plasma,
        credits: result.resources.credits,
        metalCapacity: result.resources.metalCapacity,
        plasmaCapacity: result.resources.plasmaCapacity,
        metalProduction: result.resources.metalProduction,
        plasmaProduction: result.resources.plasmaProduction,
      });
      const parts: string[] = [];
      if (result.collected.metal > 0) parts.push(`+${result.collected.metal} metal`);
      if (result.collected.plasma > 0) parts.push(`+${result.collected.plasma} plasma`);
      if (result.collected.credits > 0) parts.push(`+${result.collected.credits} créditos`);
      showToast(parts.length ? parts.join(' · ') : 'Recursos al día');
      await refresh();
    } catch (e) {
      showToast(axiosErrorMessage(e) ?? 'Error al recolectar');
    }
  }, [usingMock, showToast, refresh]);

  const upgradeSelected = useCallback(
    async (params: {
      slotIndex: number;
      type: string;
      apiBuildingId?: string;
      catalogId?: string;
    }) => {
      if (!planetId || usingMock) {
        showToast('Modo demo — inicia sesión para construir');
        return;
      }
      const apiType =
        params.type && params.type !== 'EMPTY'
          ? params.type
          : params.catalogId
            ? CATALOG_ID_TO_TYPE[params.catalogId]
            : undefined;
      if (!apiType || !isApiBuildable(apiType)) {
        setError('Este edificio no está disponible en el servidor.');
        showToast('Edificio no disponible');
        return;
      }
      setError(null);
      try {
        await buildOrUpgradeBuilding(planetId, params.slotIndex, apiType);
        showToast('Construcción en cola');
        await refresh();
      } catch (e) {
        const msg = axiosErrorMessage(e) ?? 'No se pudo construir';
        setError(msg);
        showToast(msg);
        throw e;
      }
    },
    [planetId, usingMock, refresh, showToast]
  );

  return {
    player,
    resources,
    planetId,
    planetName,
    planetType,
    grid,
    buildings,
    constructionQueue,
    usingMock,
    loading,
    error,
    actionToast,
    showToast,
    collectResources,
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
