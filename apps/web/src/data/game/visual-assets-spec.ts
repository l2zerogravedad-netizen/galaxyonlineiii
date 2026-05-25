/**
 * ESPECIFICACIONES DE ASSETS VISUALES - GALAXY ONLINE II
 * Documentación completa de todas las imágenes necesarias para tutoriales y UI
 */

// ============================================
// ESPECIFICACIONES GENERALES DE IMÁGENES
// ============================================
export interface ImageSpec {
  id: string;
  filename: string;
  path: string;
  dimensions: { width: number; height: number };
  format: 'png' | 'jpg' | 'svg';
  description: string;
  content: string; // Qué debe mostrar la imagen
  style: 'screenshot' | 'illustration' | 'diagram' | 'icon' | 'photo';
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// ============================================
// TUTORIALES - IMÁGENES REQUERIDAS
// ============================================
export const TUTORIAL_IMAGES: ImageSpec[] = [
  // ========== TUTORIAL DE BIENVENIDA ==========
  {
    id: 'tutorial_welcome_screen',
    filename: 'welcome_screen.png',
    path: '/images/tutorials/',
    dimensions: { width: 1920, height: 1080 },
    format: 'png',
    description: 'Pantalla de bienvenida inicial del juego',
    content: 'Fondo espacial con nebulosas, logo de Galaxy Online II, y personaje AVA (asistente AI femenina con apariencia holográfica azul) en primer plano. Texto "¡Bienvenido, Comandante!" prominente.',
    style: 'illustration',
    priority: 'critical'
  },
  {
    id: 'tutorial_command_center_guide',
    filename: 'command_center_guide.png',
    path: '/images/tutorials/',
    dimensions: { width: 800, height: 600 },
    format: 'png',
    description: 'Guía visual del Centro de Comando',
    content: 'Screenshot del Centro de Comando destacado con flechas y anotaciones. Mostrar: icono de edificio, nivel, botón de mejorar, producción actual. Overlay semitransparente con texto explicativo.',
    style: 'screenshot',
    priority: 'critical'
  },
  {
    id: 'tutorial_interface_overview',
    filename: 'interface_overview.png',
    path: '/images/tutorials/',
    dimensions: { width: 1920, height: 1080 },
    format: 'png',
    description: 'Vista general de la interfaz de usuario',
    content: 'Screenshot completo de la UI con callouts numerados: 1-Panel de recursos (top), 2-Panel de planetas (left), 3-Mapa estelar (center), 4-Chat (bottom-left), 5-Menú de acciones (bottom-right). Usar colores brillantes para destacar cada sección.',
    style: 'screenshot',
    priority: 'critical'
  },
  {
    id: 'tutorial_click_command_center',
    filename: 'click_command_center.png',
    path: '/images/tutorials/',
    dimensions: { width: 600, height: 400 },
    format: 'png',
    description: 'Animación de clic en Centro de Comando',
    content: 'Cursor de mano clickeando en el edificio del Centro de Comando. Efecto de ondas circulares indicando el clic. Fondo ligeramente oscurecido excepto el edificio objetivo.',
    style: 'illustration',
    priority: 'high'
  },
  {
    id: 'tutorial_resource_panel',
    filename: 'resource_panel.png',
    path: '/images/tutorials/',
    dimensions: { width: 800, height: 200 },
    format: 'png',
    description: 'Panel de recursos detallado',
    content: 'Close-up del panel superior de recursos mostrando: Metal (icono de lingote gris), Plasma (icono de orbe azul), Créditos (icono de moneda dorada). Flechas indicando producción por hora (+150/h). Barra de progreso visual.',
    style: 'screenshot',
    priority: 'high'
  },
  {
    id: 'tutorial_build_menu',
    filename: 'build_menu.png',
    path: '/images/tutorials/',
    dimensions: { width: 600, height: 800 },
    format: 'png',
    description: 'Menú de construcción abierto',
    content: 'Panel de construcción mostrando grid de edificios disponibles: Extractor de Metal, Planta de Plasma, Generador Solar, etc. Cada slot muestra: icono, nombre, costo, tiempo de construcción. Fondo oscuro con bordes brillantes.',
    style: 'screenshot',
    priority: 'high'
  },
  {
    id: 'tutorial_build_metal_extractor',
    filename: 'build_metal_extractor.png',
    path: '/images/tutorials/',
    dimensions: { width: 1000, height: 600 },
    format: 'png',
    description: 'Proceso de construcción del extractor',
    content: 'Secuencia de 3 pasos: 1-Seleccionar Extractor del menú (resaltado), 2-Colocar en el grid planetario (preview verde/rojo), 3-Confirmar construcción (botón brillante). Mostrar costos y tiempo restante.',
    style: 'screenshot',
    priority: 'critical'
  },
  {
    id: 'tutorial_production_active',
    filename: 'production_active.png',
    path: '/images/tutorials/',
    dimensions: { width: 800, height: 400 },
    format: 'png',
    description: 'Extracción de recursos en progreso',
    content: 'Edificio Extractor de Metal con animación de partículas (líneas subiendo indicando extracción). Overlay "+100 Metal/hora". Barra de progreso circular alrededor del edificio. Efectos de brillo y energía.',
    style: 'illustration',
    priority: 'high'
  },
  {
    id: 'tutorial_quests_button',
    filename: 'quests_button.png',
    path: '/images/tutorials/',
    dimensions: { width: 400, height: 200 },
    format: 'png',
    description: 'Botón de misiones destacado',
    content: 'Botón de misiones en la UI principal con notificación de "1" nueva. Icono de pergamino o lista. Efecto de pulso sutil indicando que hay recompensas pendientes. Flecha apuntando al botón.',
    style: 'screenshot',
    priority: 'medium'
  },
  {
    id: 'tutorial_claim_reward',
    filename: 'claim_reward.png',
    path: '/images/tutorials/',
    dimensions: { width: 600, height: 400 },
    format: 'png',
    description: 'Reclamar recompensa de misión',
    content: 'Panel de misión completada con botón "Reclamar" prominente (color dorado/brillante). Preview de recompensas: 500 Créditos, 500 Metal. Efectos de celebración (estrellas, confeti digital).',
    style: 'illustration',
    priority: 'medium'
  },

  // ========== TUTORIAL DE COMBATE ==========
  {
    id: 'tutorial_combat_intro',
    filename: 'combat_intro.png',
    path: '/images/tutorials/',
    dimensions: { width: 1920, height: 1080 },
    format: 'png',
    description: 'Escena de batalla espacial introductoria',
    content: 'Vista épica de flotas enfrentándose en el espacio. Naves de ambos bandos con líneas de movimiento. Explosiones en la distancia. General Vance (personaje militar con uniforme) en corner holográfico. Atmósfera dramática con iluminación azul/roja.',
    style: 'illustration',
    priority: 'critical'
  },
  {
    id: 'tutorial_combat_basics',
    filename: 'combat_basics.png',
    path: '/images/tutorials/',
    dimensions: { width: 1280, height: 720 },
    format: 'png',
    description: 'Diagrama de mecánicas de combate',
    content: 'Esquema educativo mostrando: 1-Armas (iconos de cañón, láser, misil), 2-Escudos (burbuja azul alrededor de nave), 3-Casco (barra de HP roja), 4-Formación (patrón de cuña). Flechas indicando flujo de combate. Estilo técnico pero visual.',
    style: 'diagram',
    priority: 'critical'
  },
  {
    id: 'tutorial_fleet_panel',
    filename: 'fleet_panel.png',
    path: '/images/tutorials/',
    dimensions: { width: 400, height: 800 },
    format: 'png',
    description: 'Panel de flotas detallado',
    content: 'Panel lateral mostrando lista de naves: Fragata x10, Crucero x5, Acorazado x2. Cada entrada muestra: icono de nave, cantidad, HP actual/HP max, estado (listo/dañado). Scrollbar indicando más naves disponibles.',
    style: 'screenshot',
    priority: 'high'
  },
  {
    id: 'tutorial_weapon_types',
    filename: 'weapon_types.png',
    path: '/images/tutorials/',
    dimensions: { width: 800, height: 400 },
    format: 'png',
    description: 'Comparación de tipos de armas',
    content: 'Tres columnas comparativas: BALÍSTICAS (icono cañón, pros: daño escudos, cons: corto alcance), DIRECCIONALES (icono láser, pros: atraviesa armadura, cons: consume energía), MISILES (icono cohete, pros: alto daño, cons: pueden ser interceptados). Tabla visual con iconos claros.',
    style: 'diagram',
    priority: 'high'
  },
  {
    id: 'tutorial_deploy_fleet',
    filename: 'deploy_fleet.png',
    path: '/images/tutorials/',
    dimensions: { width: 1000, height: 600 },
    format: 'png',
    description: 'Interfaz de despliegue de flota',
    content: 'Vista de mapa estelar con selección de flota. Naves seleccionadas tienen anillo verde. Botón "DESPLEGAR" grande y brillante en la parte inferior. Línea punteada indicando ruta al objetivo. Marcador del enemigo (rojo) en el destino.',
    style: 'screenshot',
    priority: 'high'
  },
  {
    id: 'tutorial_formations',
    filename: 'formations.png',
    path: '/images/tutorials/',
    dimensions: { width: 900, height: 500 },
    format: 'png',
    description: 'Diagrama de formaciones tácticas',
    content: 'Tres diagramas de formación con naves representadas como triángulos: CUÑA (V invertida, bonus +15% ataque), ESFERA (círculo, bonus +20% defensa), LÍNEA (fila, bonus +10% precisión). Flechas indicando dirección de ataque. Estilo esquemático limpio.',
    style: 'diagram',
    priority: 'medium'
  },
  {
    id: 'tutorial_combat_practice',
    filename: 'combat_practice.png',
    path: '/images/tutorials/',
    dimensions: { width: 1920, height: 1080 },
    format: 'png',
    description: 'Vista de práctica de combate',
    content: 'Screenshot del simulador de combate. Naves del jugador (azul) vs naves enemigas (rojo). UI de controles visibles: pausa, velocidad x1/x2, formación, retirada. Texto overlay "Modo Práctica - Sin consecuencias". Ambiente seguro para experimentar.',
    style: 'screenshot',
    priority: 'medium'
  },

  // ========== TUTORIAL DE INVESTIGACIÓN ==========
  {
    id: 'tutorial_research_intro',
    filename: 'research_intro.png',
    path: '/images/tutorials/',
    dimensions: { width: 1920, height: 1080 },
    format: 'png',
    description: 'Laboratorio de investigación intro',
    content: 'Vista del Laboratorio de Investigación con científicos trabajando (siluetas con batas). Hologramas flotantes mostrando fórmulas y tecnologías. Dr. Chen (científico principal con gafas y bata) presentando. Atmósfera de laboratorio futurista con luces azules.',
    style: 'illustration',
    priority: 'critical'
  },
  {
    id: 'tutorial_research_trees',
    filename: 'research_trees.png',
    path: '/images/tutorials/',
    dimensions: { width: 1200, height: 800 },
    format: 'png',
    description: 'Árboles de investigación completos',
    content: 'Vista completa de 4 árboles de tecnología: Militar (rojo), Económico (verde), Industrial (amarillo), Científico (azul). Cada árbol muestra nodos conectados con líneas. Algunos nodos desbloqueados (brillantes), otros bloqueados (grises). Leyenda explicativa.',
    style: 'screenshot',
    priority: 'critical'
  },
  {
    id: 'tutorial_tech_branches',
    filename: 'tech_branches.png',
    path: '/images/tutorials/',
    dimensions: { width: 800, height: 600 },
    format: 'png',
    description: 'Colores de ramas tecnológicas',
    content: 'Cuadrante dividido en 4 secciones coloreadas: AZUL (icono engranaje, "Economía"), ROJO (icono espada, "Combate"), VERDE (icono escudo, "Defensa"), AMARILLO (icono nave, "Naves"). Cada sección muestra 2-3 tecnologías de ejemplo. Estilo infografía limpia.',
    style: 'diagram',
    priority: 'high'
  },
  {
    id: 'tutorial_research_levels',
    filename: 'research_levels.png',
    path: '/images/tutorials/',
    dimensions: { width: 1000, height: 400 },
    format: 'png',
    description: 'Escala de niveles de investigación',
    content: 'Barra de progreso horizontal mostrando niveles 1-20. Nivel 1 marcado como "Básico" (icono bronce), Nivel 10 "Avanzado" (icono plata), Nivel 20 "Legendario" (icono oro). Ejemplos de tecnologías desbloqueadas en cada nivel. Efecto de brillo aumentando con el nivel.',
    style: 'diagram',
    priority: 'medium'
  },
  {
    id: 'tutorial_start_research',
    filename: 'start_research.png',
    path: '/images/tutorials/',
    dimensions: { width: 600, height: 400 },
    format: 'png',
    description: 'Botón de iniciar investigación',
    content: 'Close-up de tecnología seleccionada "Motores de Fusión I" con botón "INVESTIGAR" prominente (azul brillante). Costos mostrados: 1000 Metal, 500 Plasma. Tiempo: 30 minutos. Barra de progreso animada indicando investigación activa.',
    style: 'screenshot',
    priority: 'high'
  },
  {
    id: 'tutorial_research_queue',
    filename: 'research_queue.png',
    path: '/images/tutorials/',
    dimensions: { width: 800, height: 300 },
    format: 'png',
    description: 'Cola de investigaciones',
    content: 'Lista vertical de 5 slots de investigación. Slot 1: "En Progreso" (barra verde 60%). Slots 2-5: "En Cola" (iconos de tecnologías: Láseres II, Escudos III, etc.). Números indicando orden. Botón de reordenar visible.',
    style: 'screenshot',
    priority: 'medium'
  }
];

// ============================================
// VIÑETAS INFORMATIVAS - IMÁGENES REQUERIDAS
// ============================================
export const INFO_CARD_IMAGES: ImageSpec[] = [
  // ========== EDIFICIOS ==========
  {
    id: 'info_metal_extractor_img',
    filename: 'metal_extractor.png',
    path: '/images/buildings/',
    dimensions: { width: 512, height: 512 },
    format: 'png',
    description: 'Extractores de metal en funcionamiento',
    content: 'Vista isométrica de 3 extractores de metal operando en superficie planetaria. Estructuras industriales con torres de perforación. Partículas de polvo y chispas. Cielo estelar de fondo. Estilo sci-fi realista.',
    style: 'illustration',
    priority: 'critical'
  },
  {
    id: 'info_plasma_plant_img',
    filename: 'plasma_plant.png',
    path: '/images/buildings/',
    dimensions: { width: 512, height: 512 },
    format: 'png',
    description: 'Planta de procesamiento de plasma',
    content: 'Estructura futurista con esferas de contención de plasma brillando en azul/cian. Tubos de energía conectando secciones. Efectos de electricidad y campos de fuerza. Ambiente industrial limpio.',
    style: 'illustration',
    priority: 'critical'
  },
  {
    id: 'info_solar_generator_img',
    filename: 'solar_generator.png',
    path: '/images/buildings/',
    dimensions: { width: 512, height: 512 },
    format: 'png',
    description: 'Campos de paneles solares espaciales',
    content: 'Extensiones de paneles solares giratorios capturando luz estelar. Reflectores brillantes. Estructura central de conversión de energía. Espacio de fondo con estrellas.',
    style: 'illustration',
    priority: 'high'
  },
  {
    id: 'info_command_center_img',
    filename: 'command_center.png',
    path: '/images/buildings/',
    dimensions: { width: 512, height: 512 },
    format: 'png',
    description: 'Centro de comando principal',
    content: 'Torre central imponente con antenas y radares. Cúpula de cristal en la cima mostrando hologramas tácticos. Luces de estado (verde operativo). Estructura más alta que edificios circundantes.',
    style: 'illustration',
    priority: 'critical'
  },
  {
    id: 'info_shipyard_img',
    filename: 'shipyard.png',
    path: '/images/buildings/',
    dimensions: { width: 512, height: 512 },
    format: 'png',
    description: 'Astillero espacial orbital',
    content: 'Estructura orbital masiva con muelles de construcción. Naves en varias etapas de ensamblaje. Grúas espaciales y robots trabajadores. Chispas de soldadura. Fondo planetario.',
    style: 'illustration',
    priority: 'high'
  },
  {
    id: 'info_research_lab_img',
    filename: 'research_lab.png',
    path: '/images/buildings/',
    dimensions: { width: 512, height: 512 },
    format: 'png',
    description: 'Complejo de laboratorios de investigación',
    content: 'Edificio moderno con cúpulas de observación. Tubos de ensayo gigantes visibles desde fuera. Científicos en trajes protectores. Hologramas flotantes con fórmulas. Atmósfera de innovación.',
    style: 'illustration',
    priority: 'high'
  },

  // ========== NAVES ==========
  {
    id: 'info_frigate_img',
    filename: 'frigate.png',
    path: '/images/ships/',
    dimensions: { width: 512, height: 512 },
    format: 'png',
    description: 'Fragata clase interceptor',
    content: 'Nave pequeña y ágil con diseño aerodinámico. Dos alas cortas con motores. Cañones frontales visibles. Escudo de proa anguloso. Paleta de colores gris-azulado con detalles naranja. Vista 3/4 frontal.',
    style: 'illustration',
    priority: 'critical'
  },
  {
    id: 'info_cruiser_img',
    filename: 'cruiser.png',
    path: '/images/ships/',
    dimensions: { width: 512, height: 512 },
    format: 'png',
    description: 'Crucero de batalla mediano',
    content: 'Nave de tamaño mediano con casco robusto. Dos torretas laterales prominentes. Puente de mando elevado. Escudos visibles como brillo azul sutil. Diseño balanceado entre ofensivo y defensivo. Vista lateral.',
    style: 'illustration',
    priority: 'critical'
  },
  {
    id: 'info_battleship_img',
    filename: 'battleship.png',
    path: '/images/ships/',
    dimensions: { width: 512, height: 512 },
    format: 'png',
    description: 'Acorazado pesado de asalto',
    content: 'Nave masiva con armadura gruesa. Múltiples baterías de cañones. Estructura imponente y angular. Motores masivos en la popa. Paleta oscura con detalles rojos de advertencia. Vista inferior mostrando escala.',
    style: 'illustration',
    priority: 'critical'
  },

  // ========== COMBATE ==========
  {
    id: 'info_weapon_types_img',
    filename: 'weapon_types.png',
    path: '/images/combat/',
    dimensions: { width: 800, height: 400 },
    format: 'png',
    description: 'Comparativa visual de sistemas de armas',
    content: 'Tres naves mostrando diferentes armamentos: Fragata con cañones balísticos (llamas naranja), Crucero con láseres (rayos verdes), Acorazado lanzando misiles (proyectiles con trail de fuego). Comparativa dinámica en acción.',
    style: 'illustration',
    priority: 'critical'
  },
  {
    id: 'info_shield_system_img',
    filename: 'shield_system.png',
    path: '/images/combat/',
    dimensions: { width: 600, height: 600 },
    format: 'png',
    description: 'Efectos de escudo en nave',
    content: 'Close-up de nave con escudo activado (burbuja azul translúcida). Impactos de proyectiles siendo absorbidos (ondas circulares en punto de impacto). Barra de escudo UI superpuesta. Efecto de distorsión de energía.',
    style: 'illustration',
    priority: 'high'
  },
  {
    id: 'info_commanders_img',
    filename: 'system_overview.png',
    path: '/images/commanders/',
    dimensions: { width: 800, height: 600 },
    format: 'png',
    description: 'Comandantes y sus habilidades',
    content: 'Collage de 4 comandantes diferentes con sus habilidades visuales: Comandante Ofensivo (aura roja), Táctico (aura azul), Defensivo (aura verde), Soporte (aura amarilla). Cada uno con icono de habilidad destacado. Estilo de tarjeta coleccionable.',
    style: 'illustration',
    priority: 'high'
  },
  {
    id: 'info_fleet_formation_img',
    filename: 'formations.png',
    path: '/images/combat/',
    dimensions: { width: 800, height: 500 },
    format: 'png',
    description: 'Formaciones de flota en acción',
    content: 'Tres formaciones de flotas con 5 naves cada una: Cuña (atacando frontal), Esfera (defendiendo), Línea (flanqueando). Flechas indicando dirección de movimiento. Líneas conectando naves mostrando formación. Estilo táctico limpio.',
    style: 'diagram',
    priority: 'medium'
  },

  // ========== ECONOMÍA ==========
  {
    id: 'info_honor_system_img',
    filename: 'honor_system.png',
    path: '/images/economy/',
    dimensions: { width: 600, height: 400 },
    format: 'png',
    description: 'Medallas y sistema de honor',
    content: 'Display de medallas de honor de diferentes rangos: Bronce, Plata, Oro, Platino, Diamante. Cada medalla con diseño único y brillante. Contador de puntos de honor. Background de ceremonia militar espacial.',
    style: 'illustration',
    priority: 'medium'
  },
  {
    id: 'info_resources_img',
    filename: 'resources.png',
    path: '/images/economy/',
    dimensions: { width: 600, height: 300 },
    format: 'png',
    description: 'Iconos de recursos principales',
    content: 'Tres recursos principales en display: Metal (lingotes grises con brillo metálico), Plasma (orbe de energía azul pulsante), Créditos (monedas doradas con símbolo de crédito). Estilo de iconos de juego brillantes y limpios.',
    style: 'illustration',
    priority: 'critical'
  },

  // ========== SOCIAL ==========
  {
    id: 'info_corp_system_img',
    filename: 'corporation.png',
    path: '/images/social/',
    dimensions: { width: 800, height: 500 },
    format: 'png',
    description: 'Vista de corporación y miembros',
    content: 'Pantalla de corp mostrando: Logo de corp en centro, lista de miembros con rangos, tecnologías de corp desbloqueadas, chat de corp activo. Estación espacial de corp en background. Atmósfera de comunidad.',
    style: 'screenshot',
    priority: 'medium'
  },

  // ========== INVESTIGACIÓN ==========
  {
    id: 'info_tech_tree_img',
    filename: 'tech_tree.png',
    path: '/images/research/',
    dimensions: { width: 1000, height: 700 },
    format: 'png',
    description: 'Árbol tecnológico completo',
    content: 'Mapa completo de árbol de investigación militar con nodos conectados. Nodos desbloqueados en color, bloqueados en gris. Líneas de progreso brillantes. Efectos de partículas en nodos avanzados. Zoom out mostrando complejidad.',
    style: 'screenshot',
    priority: 'high'
  },

  // ========== PLANETAS ==========
  {
    id: 'info_planet_types_img',
    filename: 'types.png',
    path: '/images/planets/',
    dimensions: { width: 1000, height: 600 },
    format: 'png',
    description: 'Comparativa de tipos planetarios',
    content: 'Seis planetas en fila mostrando diversidad: Terrestre (azul/verde), Lava (rojo/naranja), Hielo (blanco/azul), Gas (rayas coloridas), Desértico (amarillo), Tecnológico (gris/metal). Cada uno con icono de recurso principal.',
    style: 'illustration',
    priority: 'high'
  }
];

// ============================================
// ICONOS DE UI REQUERIDOS
// ============================================
export const UI_ICONS_SPEC = {
  // Iconos de recursos (32x32)
  resource_icons: [
    { name: 'metal', size: 32, description: 'Lingote de metal gris' },
    { name: 'plasma', size: 32, description: 'Orbe de energía azul' },
    { name: 'credits', size: 32, description: 'Moneda dorada con C' },
    { name: 'energy', size: 32, description: 'Rayo amarillo' }
  ],
  
  // Iconos de acciones (48x48)
  action_icons: [
    { name: 'build', size: 48, description: 'Martillo y llave inglesa' },
    { name: 'research', size: 48, description: 'Matraz de laboratorio' },
    { name: 'attack', size: 48, description: 'Espada cruzada con rayo' },
    { name: 'defend', size: 48, description: 'Escudo con estrella' },
    { name: 'move', size: 48, description: 'Flechas de dirección' }
  ],
  
  // Iconos de estado (24x24)
  status_icons: [
    { name: 'online', size: 24, description: 'Círculo verde' },
    { name: 'offline', size: 24, description: 'Círculo gris' },
    { name: 'warning', size: 24, description: 'Triángulo amarillo' },
    { name: 'error', size: 24, description: 'Círculo rojo X' },
    { name: 'loading', size: 24, description: 'Spinner animado' }
  ]
};

// ============================================
// RESUMEN DE REQUERIMIENTOS
// ============================================
export const ASSETS_SUMMARY = {
  total_images: TUTORIAL_IMAGES.length + INFO_CARD_IMAGES.length,
  tutorial_images: TUTORIAL_IMAGES.length,
  info_card_images: INFO_CARD_IMAGES.length,
  
  by_priority: {
    critical: [...TUTORIAL_IMAGES, ...INFO_CARD_IMAGES].filter(i => i.priority === 'critical').length,
    high: [...TUTORIAL_IMAGES, ...INFO_CARD_IMAGES].filter(i => i.priority === 'high').length,
    medium: [...TUTORIAL_IMAGES, ...INFO_CARD_IMAGES].filter(i => i.priority === 'medium').length,
    low: [...TUTORIAL_IMAGES, ...INFO_CARD_IMAGES].filter(i => i.priority === 'low').length
  },
  
  by_category: {
    tutorials: TUTORIAL_IMAGES.length,
    buildings: INFO_CARD_IMAGES.filter(i => i.path.includes('buildings')).length,
    ships: INFO_CARD_IMAGES.filter(i => i.path.includes('ships')).length,
    combat: INFO_CARD_IMAGES.filter(i => i.path.includes('combat')).length,
    economy: INFO_CARD_IMAGES.filter(i => i.path.includes('economy')).length,
    social: INFO_CARD_IMAGES.filter(i => i.path.includes('social')).length,
    research: INFO_CARD_IMAGES.filter(i => i.path.includes('research')).length,
    planets: INFO_CARD_IMAGES.filter(i => i.path.includes('planets')).length,
    commanders: INFO_CARD_IMAGES.filter(i => i.path.includes('commanders')).length
  }
};

// ============================================
// HELPERS
// ============================================
export function getCriticalImages(): ImageSpec[] {
  return [...TUTORIAL_IMAGES, ...INFO_CARD_IMAGES].filter(i => i.priority === 'critical');
}

export function getImagesByCategory(category: string): ImageSpec[] {
  return [...TUTORIAL_IMAGES, ...INFO_CARD_IMAGES].filter(i => i.path.includes(category));
}

export function getImageById(id: string): ImageSpec | undefined {
  return [...TUTORIAL_IMAGES, ...INFO_CARD_IMAGES].find(i => i.id === id);
}

export const VisualAssetsSpec = {
  TUTORIAL_IMAGES,
  INFO_CARD_IMAGES,
  UI_ICONS_SPEC,
  ASSETS_SUMMARY,
  getCriticalImages,
  getImagesByCategory,
  getImageById
};
