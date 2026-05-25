# 🎨 INTERFAZ DE USUARIO - REFERENCIA VISUAL Y COMPONENTES

## 📋 **RESUMEN DE LA MECÁNICA**

La interfaz de usuario proporciona una experiencia intuitiva y eficiente para gestionar todos los aspectos del juego, desde la construcción de edificios hasta el diseño de naves y la coordinación de flotas.

## ✅ **DATOS CONOCIDOS (Existentes)**

### **Componentes UI Básicos**
```typescript
// Basado en settings-system.ts
interface UISettings {
  scale: number;
  textScale: number;
  language: string;
  theme: 'light' | 'dark' | 'auto';
}
```

### **Sistemas con UI Existente**
- **Configuración**: Panel de preferencias
- **Notificaciones**: Sistema de alertas
- **Chat**: Interfaz de comunicación
- **Tutorial**: Sistema de ayuda

## ❌ **DATOS FALTANTES**

### **1. Panel de Construcción**
- No hay interfaz de construcción visual
- No hay sistema de drag & drop
- No hay vista previa de edificios

### **2. Vista Táctica de Combate**
- No hay interfaz de combate por turnos
- No hay visualización de grilla 9x9
- No hay animaciones de combate

### **3. Diseñador de Naves**
- No hay interfaz modular de diseño
- No hay sistema de arrastrar componentes
- No hay vista 3D de naves

### **4. Panel de Gestión de Flotas**
- No hay interfaz de organización de flotas
- No hay visualización de formaciones
- No hay sistema de asignación táctica

### **5. Interfaz de Investigación**
- No hay árbol tecnológico visual
- No hay sistema de progreso animado
- No hay vista de dependencias

## 🎯 **PROPUESTA DE IMPLEMENTACIÓN**

### **🏗️ Panel de Construcción Planetaria**

```typescript
interface ConstructionUI {
  // Vista principal
  mainView: ConstructionMainView;
  
  // Componentes
  buildingGrid: BuildingGrid;
  buildingMenu: BuildingMenu;
  constructionQueue: ConstructionQueuePanel;
  resourcePanel: ResourcePanel;
  
  // Interacciones
  dragDropSystem: DragDropSystem;
  placementValidator: PlacementValidator;
  previewSystem: BuildingPreviewSystem;
}

interface BuildingGrid {
  // Configuración
  size: { width: number; height: number };
  cellSize: number;
  scale: number;
  
  // Renderizado
  renderCells(): void;
  renderBuildings(): void;
  renderGrid(): void;
  
  // Interacciones
  onCellClick(x: number, y: number): void;
  onCellHover(x: number, y: number): void;
  onBuildingDrag(buildingId: string): void;
  
  // Estados
  selectedCell?: { x: number; y: number };
  hoveredCell?: { x: number; y: number };
  placementMode: boolean;
}

interface BuildingMenu {
  // Categorías
  categories: BuildingCategory[];
  selectedCategory: BuildingCategory;
  
  // Lista de edificios
  buildingList: BuildingMenuItem[];
  
  // Filtros
  filters: BuildingFilter[];
  
  // Búsqueda
  searchQuery: string;
  
  // Métodos
  filterBuildings(category?: string, query?: string): BuildingMenuItem[];
  selectBuilding(buildingId: string): void;
  showBuildingDetails(buildingId: string): void;
}

interface ConstructionQueuePanel {
  // Cola de construcción
  queue: QueueItem[];
  
  // Controles
  pauseButton: Button;
  cancelButton: Button;
  reorderButton: Button;
  
  // Información
  totalTime: number;
  totalCost: Record<ResourceKey, number>;
  
  // Métodos
  addItem(buildingId: string, action: QueueAction): void;
  removeItem(itemId: string): void;
  reorderItems(itemIds: string[]): void;
  pauseItem(itemId: string): void;
}
```

### **⚔️ Vista Táctica de Combate**

```typescript
interface CombatUI {
  // Vista principal
  combatView: CombatMainView;
  
  // Componentes
  combatGrid: CombatGrid;
  unitInfo: UnitInfoPanel;
  actionPanel: ActionPanel;
  turnIndicator: TurnIndicator;
  
  // Animaciones
  animationSystem: CombatAnimationSystem;
  
  // Controles
  cameraController: CameraController;
}

interface CombatGrid {
  // Configuración
  gridSize: { width: number; height: number }; // 9x9
  cellSize: number;
  
  // Renderizado
  renderGrid(): void;
  renderUnits(): void;
  renderTerrain(): void;
  renderEffects(): void;
  
  // Interacciones
  onCellClick(x: number, y: number): void;
  onUnitClick(unitId: string): void;
  onDragSelect(startX: number, startY: number, endX: number, endY: number): void;
  
  // Estados
  selectedUnits: string[];
  hoveredCell?: { x: number; y: number };
  attackMode: boolean;
}

interface ActionPanel {
  // Acciones disponibles
  availableActions: CombatAction[];
  
  // Botones de acción
  attackButton: ActionButton;
  defendButton: ActionButton;
  moveButton: ActionButton;
  specialButton: ActionButton;
  
  // Información de acción
  actionPreview: ActionPreview;
  
  // Métodos
  selectAction(action: CombatAction): void;
  showActionPreview(action: CombatAction, target: Target): void;
  executeAction(action: CombatAction, target: Target): void;
}

interface TurnIndicator {
  // Información del turno
  currentTurn: number;
  maxTurns: number;
  currentPlayer: string;
  
  // Temporizador
  timeRemaining: number;
  maxTime: number;
  
  // Visualización
  render(): void;
  
  // Eventos
  onTurnEnd(): void;
  onTimeExpired(): void;
}
```

### **🚀 Diseñador de Naves**

```typescript
interface ShipDesignerUI {
  // Vista principal
  designerView: ShipDesignerView;
  
  // Componentes
  hullSelector: HullSelector;
  componentPanel: ComponentPanel;
  shipCanvas: ShipCanvas;
  statsPanel: StatsPanel;
  
  // Herramientas
  toolbar: DesignerToolbar;
  
  // Sistemas
  validationSystem: DesignValidationSystem;
  saveSystem: DesignSaveSystem;
}

interface HullSelector {
  // Lista de cascos
  hulls: HullOption[];
  
  // Filtros
  filters: HullFilter[];
  
  // Vista
  listView: boolean;
  gridView: boolean;
  
  // Métodos
  selectHull(hullId: string): void;
  filterHulls(criteria: HullFilter[]): void;
  showHullDetails(hullId: string): void;
}

interface ComponentPanel {
  // Categorías de componentes
  categories: ComponentCategory[];
  selectedCategory: ComponentCategory;
  
  // Lista de componentes
  components: ComponentOption[];
  
  // Slots disponibles
  availableSlots: SlotInfo[];
  
  // Métodos
  selectComponent(componentId: string): void;
  showComponentDetails(componentId: string): void;
  dragComponent(componentId: string): void;
}

interface ShipCanvas {
  // Renderizado 3D
  renderer: ShipRenderer;
  
  // Sistema de slots
  slotSystem: SlotSystem;
  
  // Interacciones
  onSlotClick(slotId: string): void;
  onComponentDrop(slotId: string, componentId: string): void;
  
  // Vistas
  camera: Camera;
  lighting: Lighting;
  
  // Métodos
  renderShip(): void;
  rotateShip(angle: number): void;
  zoomShip(factor: number): void;
}

interface StatsPanel {
  // Estadísticas calculadas
  stats: CalculatedStats;
  
  // Comparación
  comparisonMode: boolean;
  comparisonStats?: CalculatedStats;
  
  // Visualización
  charts: StatChart[];
  
  // Métodos
  updateStats(design: ShipDesign): void;
  showComparison(design1: ShipDesign, design2: ShipDesign): void;
  exportStats(): string;
}
```

### **👥 Panel de Gestión de Flotas**

```typescript
interface FleetManagementUI {
  // Vista principal
  fleetView: FleetMainView;
  
  // Componentes
  fleetList: FleetList;
  formationEditor: FormationEditor;
  shipSelector: ShipSelector;
  commanderSelector: CommanderSelector;
  
  // Herramientas
  fleetTools: FleetTools;
}

interface FleetList {
  // Lista de flotas
  fleets: FleetItem[];
  
  // Filtros
  filters: FleetFilter[];
  
  // Ordenamiento
  sortBy: FleetSortField;
  sortOrder: 'asc' | 'desc';
  
  // Métodos
  selectFleet(fleetId: string): void;
  createFleet(): void;
  deleteFleet(fleetId: string): void;
  filterFleets(criteria: FleetFilter[]): void;
}

interface FormationEditor {
  // Grilla de formación
  formationGrid: FormationGrid;
  
  // Herramientas
  placementTool: PlacementTool;
  selectionTool: SelectionTool;
  
  // Plantillas
  templates: FormationTemplate[];
  
  // Métodos
  placeShip(shipId: string, x: number, y: number): void;
  removeShip(position: { x: number; y: number }): void;
  saveFormation(name: string): void;
  loadFormation(templateId: string): void;
}

interface FormationGrid {
  // Configuración
  gridSize: { width: number; height: number };
  cellSize: number;
  
  // Renderizado
  renderGrid(): void;
  renderShips(): void;
  renderCommander(): void;
  
  // Interacciones
  onCellClick(x: number, y: number): void;
  onShipDrag(shipId: string, fromX: number, fromY: number, toX: number, toY: number): void;
  
  // Validación
  validateFormation(): ValidationResult;
}
```

### **🔬 Interfaz de Investigación**

```typescript
interface ResearchUI {
  // Vista principal
  researchView: ResearchMainView;
  
  // Componentes
  techTree: TechTreeView;
  researchQueue: ResearchQueuePanel;
  techDetails: TechDetailsPanel;
  
  // Navegación
  categorySelector: CategorySelector;
  searchBox: SearchBox;
}

interface TechTreeView {
  // Árbol tecnológico
  tree: TechTreeData;
  
  // Renderizado
  renderer: TechTreeRenderer;
  
  // Navegación
  camera: TreeCamera;
  
  // Interacciones
  onNodeClick(nodeId: string): void;
  onNodeHover(nodeId: string): void;
  zoomToNode(nodeId: string): void;
  
  // Estados
  selectedNode?: string;
  hoveredNode?: string;
  filterMode: 'all' | 'available' | 'researching' | 'completed';
}

interface TechTreeRenderer {
  // Configuración visual
  nodeSize: number;
  connectionWidth: number;
  colors: TechTreeColors;
  
  // Renderizado
  renderTree(): void;
  renderNode(node: TechNode): void;
  renderConnection(from: TechNode, to: TechNode): void;
  
  // Animaciones
  animateUnlock(nodeId: string): void;
  animateResearch(nodeId: string, progress: number): void;
  
  // Efectos
  highlightPath(targetNodeId: string): void;
  showDependencies(nodeId: string): void;
}

interface ResearchQueuePanel {
  // Cola de investigación
  queue: ResearchQueueItem[];
  
  // Controles
  pauseButton: Button;
  cancelButton: Button;
  accelerateButton: Button;
  
  // Información
  totalTime: number;
  totalCost: Record<ResourceKey, number>;
  
  // Métodos
  addItem(techId: string): void;
  removeItem(itemId: string): void;
  reorderItems(itemIds: string[]): void;
  accelerateItem(itemId: string, resources: Record<ResourceKey, number>): void;
}
```

## 📊 **MODELOS DE DATOS SUGERIDOS**

### **🎨 Gestor de UI**

```typescript
interface UIManager {
  // Gestión de ventanas
  windows: UIWindow[];
  activeWindow?: string;
  
  // Temas y estilos
  theme: UITheme;
  themes: Record<string, UITheme>;
  
  // Configuración
  settings: UISettings;
  
  // Métodos
  openWindow(windowId: string, config: WindowConfig): void;
  closeWindow(windowId: string): void;
  switchTheme(themeId: string): void;
  updateSettings(settings: Partial<UISettings>): void;
}

interface UIWindow {
  id: string;
  title: string;
  content: React.ComponentType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minimizable: boolean;
  resizable: boolean;
  closable: boolean;
}
```

### **📈 Sistema de Animaciones**

```typescript
interface AnimationSystem {
  // Animaciones activas
  animations: Animation[];
  
  // Tipos de animaciones
  types: AnimationType[];
  
  // Métodos
  playAnimation(type: AnimationType, target: string, options?: AnimationOptions): void;
  stopAnimation(animationId: string): void;
  pauseAnimation(animationId: string): void;
  
  // Configuración
  globalSpeed: number;
  enabled: boolean;
}

type AnimationType = 
  | 'building_construction'
  | 'ship_explosion'
  | 'weapon_fire'
  | 'shield_hit'
  | 'tech_unlock'
  | 'fleet_movement'
  | 'combat_turn'
  | 'resource_collection';
```

## ⚠️ **PENDIENTES PARA PROGRAMACIÓN**

### **🔥 Alta Prioridad**
1. **Implementar panel de construcción visual**
2. **Crear vista táctica de combate**
3. **Desarrollar diseñador de naves**
4. **Agregar panel de gestión de flotas**

### **⚡ Media Prioridad**
1. **Interfaz de investigación**
2. **Sistema de animaciones**
3. **Temas y personalización**
4. **Accesibilidad**

### **🔮 Baja Prioridad**
1. **Efectos visuales avanzados**
2. **Modo inmersivo**
3. **VR/AR support**
4. **Interfaz de voz**

## 🎮 **EJEMPLOS DE USO**

### **Construcción con Drag & Drop**
```typescript
// Iniciar modo de construcción
ConstructionUI.enterPlacementMode('metal_extractor');

// Manejar evento de drop
BuildingGrid.onDrop = (x, y, buildingId) => {
  if (PlacementValidator.canPlace(x, y, buildingId)) {
    ConstructionUI.placeBuilding(x, y, buildingId);
  }
};

// Mostrar vista previa
BuildingGrid.onHover = (x, y) => {
  BuildingPreviewSystem.showPreview(x, y, buildingId);
};
```

### **Combate Táctico**
```typescript
// Seleccionar unidades
CombatGrid.onDragSelect = (startX, startY, endX, endY) => {
  const units = CombatGrid.getUnitsInArea(startX, startY, endX, endY);
  CombatUI.selectUnits(units);
};

// Ejecutar acción
ActionPanel.onActionSelect = (action) => {
  CombatUI.showActionPreview(action);
  CombatGrid.enterTargetMode(action);
};

// Animar combate
AnimationSystem.playAnimation('weapon_fire', 'ship_001', {
  target: 'ship_002',
  duration: 1000
});
```

### **Diseño de Naves**
```typescript
// Seleccionar casco
HullSelector.onSelect = (hullId) => {
  ShipCanvas.loadHull(hullId);
  StatsPanel.updateStats(currentDesign);
};

// Arrastrar componente
ComponentPanel.onDrag = (componentId) => {
  ShipCanvas.enterDropMode(componentId);
};

// Validar diseño
ShipCanvas.onComponentDrop = (slotId, componentId) => {
  if (ValidationSystem.validatePlacement(slotId, componentId)) {
    ShipCanvas.addComponent(slotId, componentId);
    StatsPanel.updateStats(currentDesign);
  }
};
```

## 📈 **MÉTRICAS DE ÉXITO**

### **Indicadores Clave**
- **Tiempo de respuesta**: <100ms para interacciones básicas
- **FPS objetivo**: 60 FPS para animaciones fluidas
- **Carga inicial**: <3 segundos para interfaz completa
- **Uso de memoria**: <500MB para UI completa

### **Experiencia de Usuario**
- **Curva de aprendizaje**: <30 minutos para funciones básicas
- **Eficiencia**: Reducción del 50% en tiempo de gestión
- **Error rate**: <1% de acciones incorrectas
- **Satisfacción**: >85% de usuarios satisfechos

### **Accesibilidad**
- **Contraste**: Cumplimiento WCAG AA
- **Navegación**: 100% navegable por teclado
- **Lectores de pantalla**: Compatibilidad completa
- **Personalización**: Ajustes de tamaño y colores

---

**📍 Próximo paso**: Crear roadmap de implementación final.
