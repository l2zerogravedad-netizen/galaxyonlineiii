# Plan: Galaxy Map - Galaxy Online III

## Objetivo
Implementar la pantalla de Mapa de Galaxia (`/dashboard/galaxy`) con la calidad visual del Galaxy Online II original, incluyendo:
- Fondo espacial con nebulosas y estrellas parallax
- Sistema planetario interactivo con zoom y pan
- Planetas de diferentes tipos (hielo, fuego, tierra, gas, lava)
- Info de jugadores y alianzas sobre cada planeta
- Minimapa de navegación
- Coordenadas espaciales
- Chat en vivo integrado
- Integración con el diseño GO2 existente (Go2BottomNav)

## Estructura del Proyecto
- `apps/web/` - Frontend Next.js + Tailwind CSS
- Ruta objetivo: `/dashboard/galaxy/page.tsx` (placeholder actual)
- Estilos GO2: `go2-planet.css` (patrón de diseño existente)
- Tema: Oscuro con ámbar/dorado y cian

## Stage 1: Diseño del Galaxy Map (Canvas-based)

Crear los archivos:
1. `apps/web/src/components/game/go2/galaxy/Go2GalaxyScreen.tsx` - Componente principal
2. `apps/web/src/components/game/go2/galaxy/Go2GalaxyMap.tsx` - Canvas del mapa
3. `apps/web/src/components/game/go2/galaxy/Go2GalaxyMinimap.tsx` - Minimapa
4. `apps/web/src/components/game/go2/galaxy/Go2GalaxyChat.tsx` - Chat en vivo
5. `apps/web/src/components/game/go2/galaxy/Go2GalaxyTooltip.tsx` - Tooltip de planeta
6. `apps/web/src/components/game/go2/galaxy/go2-galaxy.css` - Estilos del mapa
7. `apps/web/src/components/game/go2/galaxy/galaxy-data.ts` - Datos mock de planetas
8. `apps/web/src/components/game/go2/galaxy/useGalaxyMap.ts` - Hook de lógica del mapa

## Stage 2: Integración

- Actualizar `/dashboard/galaxy/page.tsx` para usar Go2GalaxyScreen
- Asegurar compatibilidad con Go2BottomNav
- Mantener consistencia visual con el tema GO2

## Stage 3: Deploy

- Desplegar a Railway para visualización

## Skill: vibecoding-general-swarm para implementación
