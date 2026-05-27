import { useCallback, useEffect, useRef, useState } from 'react';
import { GALAXY_PLANETS, GALAXY_SIZE } from './galaxy-data';
import type { GalaxyPlanet } from './galaxy-data';

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export interface TooltipState {
  planet: GalaxyPlanet | null;
  x: number;
  y: number;
  visible: boolean;
}

const CELL_SIZE = GALAXY_SIZE.cellSize;
const PLANET_RADIUS = 24;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 3.0;
const ZOOM_SENSITIVITY = 0.001;

export function useGalaxyMap() {
  const [camera, setCamera] = useState<CameraState>({ x: 0, y: 0, zoom: 1.0 });
  const [hoveredPlanet, setHoveredPlanet] = useState<GalaxyPlanet | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<GalaxyPlanet | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    planet: null,
    x: 0,
    y: 0,
    visible: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraRef = useRef(camera);
  cameraRef.current = camera;

  const worldToScreen = useCallback(
    (wx: number, wy: number): { sx: number; sy: number } => {
      const cam = cameraRef.current;
      const { width, height } = canvasSizeRef.current;
      const centerX = width / 2;
      const centerY = height / 2;
      return {
        sx: centerX + (wx - cam.x) * cam.zoom,
        sy: centerY + (wy - cam.y) * cam.zoom,
      };
    },
    []
  );

  const screenToWorld = useCallback(
    (sx: number, sy: number): { wx: number; wy: number } => {
      const cam = cameraRef.current;
      const { width, height } = canvasSizeRef.current;
      const centerX = width / 2;
      const centerY = height / 2;
      return {
        wx: (sx - centerX) / cam.zoom + cam.x,
        wy: (sy - centerY) / cam.zoom + cam.y,
      };
    },
    []
  );

  const findPlanetAt = useCallback(
    (screenX: number, screenY: number): GalaxyPlanet | null => {
      const cam = cameraRef.current;
      const r = PLANET_RADIUS * cam.zoom;
      for (const planet of GALAXY_PLANETS) {
        const { sx, sy } = worldToScreen(
          planet.x * CELL_SIZE,
          planet.y * CELL_SIZE
        );
        const dx = screenX - sx;
        const dy = screenY - sy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < r + 5) {
          return planet;
        }
      }
      return null;
    },
    [worldToScreen]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (isDraggingRef.current) {
        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
        setCamera((prev) => ({
          ...prev,
          x: prev.x - dx / prev.zoom,
          y: prev.y - dy / prev.zoom,
        }));
        setTooltip((prev) => ({ ...prev, visible: false }));
      } else {
        const planet = findPlanetAt(mouseX, mouseY);
        setHoveredPlanet(planet);
        if (planet) {
          setTooltip({
            planet,
            x: e.clientX + 12,
            y: e.clientY - 12,
            visible: true,
          });
        } else {
          setTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        }
      }
    },
    [findPlanetAt]
  );

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const planet = findPlanetAt(mouseX, mouseY);
      setSelectedPlanet(planet);
    },
    [findPlanetAt]
  );

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setCamera((prev) => {
      const newZoom = Math.min(
        ZOOM_MAX,
        Math.max(ZOOM_MIN, prev.zoom - e.deltaY * ZOOM_SENSITIVITY * prev.zoom)
      );
      return { ...prev, zoom: newZoom };
    });
  }, []);

  const updateCanvasSize = useCallback((width: number, height: number) => {
    canvasSizeRef.current = { width, height };
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const viewportCoords = {
    topLeft: screenToWorld(0, 0),
    bottomRight: screenToWorld(canvasSizeRef.current.width, canvasSizeRef.current.height),
  };

  return {
    camera,
    hoveredPlanet,
    selectedPlanet,
    tooltip,
    containerRef,
    worldToScreen,
    screenToWorld,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleClick,
    handleWheel,
    updateCanvasSize,
    viewportCoords,
    canvasSizeRef,
  };
}
