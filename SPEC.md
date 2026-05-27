# SPEC: Galaxy Map — Galaxy Online III

## Contexto
Proyecto existente Galaxy Online III (Next.js + Tailwind). Se debe implementar la pantalla `/dashboard/galaxy` reemplazando el placeholder actual.

## Diseño Visual (basado en imagen original GO2)
- Fondo espacial profundo (#020408) con nebulosas generadas proceduralmente
- Estrellas parallax en múltiples capas
- Planetas en cuadrícula espacial con coordenadas (X:Y)
- Cada planeta muestra: icono circular, nombre del jugador, etiqueta de alianza
- Diferentes tipos de planetas con colores distintivos
- Minimapa en esquina inferior derecha
- Chat en vivo en esquina inferior izquierda  
- Barra de navegación inferior Go2BottomNav (ya existe)
- Efecto de hover con glow dorado
- Zoom con scroll wheel, pan con drag

## Componentes

### 1. `Go2GalaxyScreen` — Componente principal
```tsx
interface Go2GalaxyScreenProps {
  // No props — usa datos mock internamente
}
```
- Layout: full viewport (100dvh)
- Background: canvas de nebulosa + estrellas
- Contiene: GalaxyMap (centro), Minimap (esquina), Chat (esquina), Tooltip (overlay)

### 2. `Go2GalaxyMap` — Canvas del mapa
```tsx
interface GalaxyMapProps {
  planets: GalaxyPlanet[];
  onPlanetHover: (planet: GalaxyPlanet | null, x: number, y: number) => void;
  onPlanetClick: (planet: GalaxyPlanet) => void;
  camera: CameraState;
  onCameraChange: (camera: CameraState) => void;
}

interface CameraState {
  x: number;      // offset X en px
  y: number;      // offset Y en px  
  zoom: number;   // escala (0.5 - 3.0)
}

interface GalaxyPlanet {
  id: string;
  name: string;
  playerName: string;
  alliance: string;
  allianceTag: string;     // "[Destiny]", "[Salvation]", "[=INFERN=]"
  level: number;
  type: 'ice' | 'fire' | 'earth' | 'gas' | 'lava' | 'resource';
  x: number;               // coordenada de grid (0-99)
  y: number;               // coordenada de grid (0-99)
  hasShield: boolean;
  population: number;
  resources: { metal: number; crystal: number; energy: number };
}
```

**Canvas rendering:**
- Capa 1: Nebulosa procedural (gradientes radiales suaves, colores: púrpura #2d1b69, cian #0a4a5b, azul #0d1b4a)
- Capa 2: Estrellas parallax (3 capas con diferentes opacidades y velocidades)
- Capa 3: Grid sutil (líneas muy tenues cada 100px)
- Capa 4: Conexiones entre planetas (líneas tenues si están cerca)
- Capa 5: Planetas (círculos con gradiente según tipo + glow + anillos para gas)
- Capa 6: Labels (nombre del jugador + etiqueta de alianza encima del planeta)

**Interacción:**
- Mouse drag → pan de cámara
- Scroll wheel → zoom in/out (con límite 0.5x - 3.0x)
- Hover en planeta → glow dorado + tooltip
- Click en planeta → acción (navegar al planeta)

### 3. `Go2GalaxyMinimap` — Minimapa de navegación
```tsx
interface GalaxyMinimapProps {
  planets: GalaxyPlanet[];
  camera: CameraState;
  mapWidth: number;    // tamaño total del mapa en celdas
  mapHeight: number;
  onViewportClick: (x: number, y: number) => void;
}
```
- Canvas pequeño (150x150px) en esquina inferior derecha
- Muestra todos los planetas como puntos de colores
- Rectángulo indicando el viewport actual
- Click para teleportar cámara

### 4. `Go2GalaxyChat` — Chat en vivo
```tsx
interface GalaxyChatProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  channel: string;  // "global", "alliance", "system"
}

interface ChatMessage {
  id: string;
  sender: string;
  alliance?: string;
  text: string;
  timestamp: Date;
  type: 'player' | 'system' | 'alliance';
}
```
- Panel en esquina inferior izquierda (300x200px)
- Lista de mensajes scrolleable
- Input para enviar mensajes
- Tabs: Global, Alianza, Sistema

### 5. `Go2GalaxyTooltip` — Info de planeta
```tsx
interface GalaxyTooltipProps {
  planet: GalaxyPlanet | null;
  mouseX: number;
  mouseY: number;
}
```
- Aparece al hacer hover en un planeta
- Muestra: nombre del planeta, jugador, alianza, nivel, recursos, población
- Posición: cerca del cursor pero sin salirse de la pantalla

### 6. `galaxy-data.ts` — Datos mock
- Generar 30-50 planetas con distribución espacial realista
- Diferentes alianzas: Destiny, Salvation, INFerno, Confederacy, Independent
- Diferentes tipos de planetas mezclados
- Coordenadas X:Y del 0-99

### 7. `go2-galaxy.css` — Estilos
- Fondo espacial con gradiente radial
- Estilos del chat, minimap, tooltip
- Animaciones: glow de planetas, fade-in de UI
- Scrollbar personalizado

## Colores por tipo de planeta
```
ice:      gradiente #a5d8ff → #4dabf7 (azul hielo)
fire:    gradiente #ff6b6b → #c92a2a (rojo fuego)  
earth:   gradiente #69db7c → #2f9e44 (verde tierra)
gas:     gradiente #da77f2 → #9c36b5 (púrpura gas) + anillos
lava:    gradiente #ffa94d → #e8590c (naranja lava)
resource: gradiente #ffd43b → #f08c00 (dorado recursos)
```

## Colores por alianza
```
Destiny:    #4dabf7 (azul)
Salvation:  #69db7c (verde)
INFerno:    #ff6b6b (rojo)
Confederacy: #ffd43b (dorado)
Independent: #adb5bd (gris)
```

## Integración
- Archivo: `apps/web/src/app/dashboard/galaxy/page.tsx`
- Importar y renderizar `<Go2GalaxyScreen />`
- Go2BottomNav se mantiene (ya está integrado en el layout)

## Tecnología
- React + TypeScript + Next.js
- Canvas API para el mapa principal y minimapa
- CSS modules para estilos
- Lucide React para iconos (ya está en el proyecto)
