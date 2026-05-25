/**
 * SISTEMA DE TUTORIALES - GALAXY ONLINE II
 * Guías interactivas, tooltips, viñetas informativas y onboarding
 */

// ============================================
// TIPOS DE TUTORIALES
// ============================================
export type TutorialType = 
  | 'intro'           // Introducción al juego
  | 'feature'         // Nuevo feature desbloqueado
  | 'mechanic'        // Mecánica de juego
  | 'ui'              // Interfaz de usuario
  | 'combat'          // Combate
  | 'economy'         // Economía
  | 'social';         // Sistema social

export type TutorialStepType = 
  | 'highlight'       // Resaltar elemento
  | 'dialog'          // Diálogo con NPC
  | 'action'          // Requerir acción del jugador
  | 'video'           // Mostrar video
  | 'tooltip'         // Tooltip explicativo
  | 'free_roam';      // Libre exploración

// ============================================
// ESTRUCTURA DE TUTORIAL
// ============================================
export interface TutorialStep {
  id: string;
  order: number;
  type: TutorialStepType;
  
  content: {
    title?: string;
    text: string;
    image?: string;
    video?: string;
    npcAvatar?: string;
    npcName?: string;
  };
  
  // Highlight específico
  highlight?: {
    targetSelector: string; // CSS selector del elemento
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    pulse: boolean;
    dimBackground: boolean;
  };
  
  // Requerimientos
  requiredAction?: {
    type: 'click' | 'build' | 'research' | 'navigate' | 'wait';
    target?: string;
    duration?: number; // Para wait
  };
  
  // Opciones
  skippable: boolean;
  autoAdvance: boolean;
  canGoBack: boolean;
  
  // Rewards por completar
  rewards?: {
    resources?: Record<string, number>;
    items?: string[];
  };
}

export interface Tutorial {
  id: string;
  name: string;
  description: string;
  type: TutorialType;
  
  // Condiciones
  trigger: {
    type: 'first_time' | 'level_reached' | 'feature_unlocked' | 'manual';
    value?: number | string;
  };
  
  steps: TutorialStep[];
  
  // Configuración
  estimatedDuration: number; // minutos
  difficulty: 'easy' | 'medium' | 'hard';
  requiredLevel: number;
  
  // Estado
  replayable: boolean;
  completionReward: {
    resources: Record<string, number>;
    items?: string[];
    title?: string;
  };
  
  // Meta
  icon: string;
  category: string;
}

// ============================================
// TUTORIALES PRINCIPALES
// ============================================
export const MAIN_TUTORIALS: Tutorial[] = [
  {
    id: 'tutorial_welcome',
    name: 'Bienvenido a Galaxy Online II',
    description: 'Aprende los conceptos básicos del juego.',
    type: 'intro',
    trigger: { type: 'first_time' },
    steps: [
      {
        id: 'welcome_01',
        order: 1,
        type: 'dialog',
        content: {
          title: '¡Bienvenido, Comandante!',
          text: 'Soy tu asistente virtual. Te guiaré por los conceptos básicos de Galaxy Online II.',
          image: '/images/tutorials/welcome_screen.png',
          npcAvatar: 'assistant_ai.png',
          npcName: 'AVA'
        },
        skippable: false,
        autoAdvance: false,
        canGoBack: false
      },
      {
        id: 'welcome_02',
        order: 2,
        type: 'highlight',
        content: {
          title: 'Tu Centro de Comando',
          text: 'Este es tu Centro de Comando. Desde aquí gestionarás todo tu imperio. Es el edificio más importante - si cae, pierdes la batalla.',
          image: '/images/tutorials/command_center_guide.png'
        },
        highlight: {
          targetSelector: '#command-center',
          position: 'bottom',
          pulse: true,
          dimBackground: true
        },
        skippable: true,
        autoAdvance: false,
        canGoBack: true
      },
      {
        id: 'welcome_03',
        order: 3,
        type: 'video',
        content: {
          title: 'Interfaz Principal',
          text: 'Así se ve tu interfaz. El panel superior muestra recursos, el izquierdo tus planetas, y el central el mapa estelar.',
          image: '/images/tutorials/interface_overview.png',
          video: 'interface_tutorial.mp4'
        },
        skippable: true,
        autoAdvance: false,
        canGoBack: true
      },
      {
        id: 'welcome_04',
        order: 4,
        type: 'action',
        content: {
          title: 'Centro de Comando',
          text: 'Haz clic en el Centro de Comando para ver tus opciones de construcción e investigación.',
          image: '/images/tutorials/click_command_center.png'
        },
        highlight: {
          targetSelector: '#command-center',
          position: 'center',
          pulse: true,
          dimBackground: false
        },
        requiredAction: {
          type: 'click',
          target: '#command-center'
        },
        skippable: false,
        autoAdvance: false,
        canGoBack: false
      },
      {
        id: 'welcome_05',
        order: 5,
        type: 'tooltip',
        content: {
          title: 'Panel de Recursos',
          text: 'Estos son tus recursos. Metal y Plasma son los recursos básicos que necesitarás para construir. Los créditos se usan para compras y contratar.',
          image: '/images/tutorials/resource_panel.png'
        },
        highlight: {
          targetSelector: '#resource-panel',
          position: 'bottom',
          pulse: false,
          dimBackground: true
        },
        skippable: true,
        autoAdvance: false,
        canGoBack: true
      },
      {
        id: 'welcome_06',
        order: 6,
        type: 'tooltip',
        content: {
          title: 'Menú de Construcción',
          text: 'Aquí puedes ver todos los edificios disponibles. Cada edificio tiene un propósito específico. Pasa el cursor sobre ellos para ver detalles.',
          image: '/images/tutorials/build_menu.png'
        },
        highlight: {
          targetSelector: '#build-menu',
          position: 'right',
          pulse: true,
          dimBackground: true
        },
        skippable: true,
        autoAdvance: false,
        canGoBack: true
      },
      {
        id: 'welcome_07',
        order: 7,
        type: 'action',
        content: {
          title: 'Tu Primera Construcción',
          text: 'Construye tu primer Extractor de Metal. Es fundamental para obtener recursos. Haz clic en "Construir" y selecciona dónde ubicarlo.',
          image: '/images/tutorials/build_metal_extractor.png'
        },
        highlight: {
          targetSelector: '#build-menu',
          position: 'right',
          pulse: true,
          dimBackground: true
        },
        requiredAction: {
          type: 'build',
          target: 'metal_extractor'
        },
        skippable: false,
        autoAdvance: false,
        canGoBack: false,
        rewards: {
          resources: { metal: 1000 }
        }
      },
      {
        id: 'welcome_08',
        order: 8,
        type: 'dialog',
        content: {
          title: '¡Excelente!',
          text: 'Has construido tu primer extractor. Ahora producirás metal automáticamente. La producción continúa incluso cuando no estás jugando.',
          image: '/images/tutorials/production_active.png',
          npcAvatar: 'assistant_ai.png',
          npcName: 'AVA'
        },
        skippable: true,
        autoAdvance: false,
        canGoBack: false
      },
      {
        id: 'welcome_09',
        order: 9,
        type: 'highlight',
        content: {
          title: 'Misiones Disponibles',
          text: 'El botón de misiones te muestra objetivos para completar. Terminarlos te da recursos y experiencia.',
          image: '/images/tutorials/quests_button.png'
        },
        highlight: {
          targetSelector: '#quest-button',
          position: 'left',
          pulse: true,
          dimBackground: true
        },
        skippable: true,
        autoAdvance: false,
        canGoBack: true
      },
      {
        id: 'welcome_10',
        order: 10,
        type: 'action',
        content: {
          title: 'Primera Misión',
          text: 'Abre el panel de misiones y reclama tu primera recompensa por completar el tutorial.',
          image: '/images/tutorials/claim_reward.png'
        },
        requiredAction: {
          type: 'click',
          target: '#quest-claim'
        },
        skippable: false,
        autoAdvance: false,
        canGoBack: false,
        rewards: {
          resources: { credits: 500, metal: 500 }
        }
      }
    ],
    estimatedDuration: 5,
    difficulty: 'easy',
    requiredLevel: 1,
    replayable: true,
    completionReward: {
      resources: { credits: 5000, metal: 5000, plasma: 2500 },
      title: 'Graduado'
    },
    icon: '🎓',
    category: 'basic'
  },
  
  {
    id: 'tutorial_combat',
    name: 'Guía de Combate',
    description: 'Aprende a luchar y ganar batallas.',
    type: 'combat',
    trigger: { type: 'feature_unlocked', value: 'shipyard' },
    steps: [
      {
        id: 'combat_01',
        order: 1,
        type: 'dialog',
        content: {
          title: 'Preparación para el Combate',
          text: 'Las flotas hostiles acechan el espacio. Necesitas aprender a defenderte.',
          image: '/images/tutorials/combat_intro.png',
          npcAvatar: 'general_military.png',
          npcName: 'General Vance'
        },
        skippable: true,
        autoAdvance: false,
        canGoBack: false
      },
      {
        id: 'combat_02',
        order: 2,
        type: 'video',
        content: {
          title: 'Conceptos Básicos',
          text: 'Mira este video sobre las bases del combate. Aprenderás sobre armas, escudos y formaciones.',
          image: '/images/tutorials/combat_basics.png',
          video: 'combat_basics.mp4'
        },
        skippable: true,
        autoAdvance: false,
        canGoBack: true
      },
      {
        id: 'combat_03',
        order: 3,
        type: 'highlight',
        content: {
          title: 'Tu Flota',
          text: 'Esta es tu flota. Aquí puedes ver tus naves disponibles, sus stats y capacidades.',
          image: '/images/tutorials/fleet_panel.png'
        },
        highlight: {
          targetSelector: '#fleet-panel',
          position: 'left',
          pulse: true,
          dimBackground: true
        },
        skippable: true,
        autoAdvance: false,
        canGoBack: true
      },
      {
        id: 'combat_04',
        order: 4,
        type: 'tooltip',
        content: {
          title: 'Tipos de Armas',
          text: 'Las balísticas dañan escudos, las direccionales atraviesan armadura, los misiles tienen alto daño pero pueden ser interceptados.',
          image: '/images/tutorials/weapon_types.png'
        },
        highlight: {
          targetSelector: '#weapon-info',
          position: 'right',
          pulse: true,
          dimBackground: true
        },
        skippable: true,
        autoAdvance: false,
        canGoBack: true
      },
      {
        id: 'combat_05',
        order: 5,
        type: 'action',
        content: {
          title: 'Desplegar Flota',
          text: 'Envía tu flota a interceptar enemigos cercanos. Selecciona naves y presiona el botón de desplegar.',
          image: '/images/tutorials/deploy_fleet.png'
        },
        highlight: {
          targetSelector: '#deploy-fleet',
          position: 'bottom',
          pulse: true,
          dimBackground: true
        },
        requiredAction: {
          type: 'navigate',
          target: '#deploy-fleet'
        },
        skippable: false,
        autoAdvance: false,
        canGoBack: false
      },
      {
        id: 'combat_06',
        order: 6,
        type: 'tooltip',
        content: {
          title: 'Formaciones',
          text: 'Las formaciones tácticas otorgan bonus. Cuña aumenta ataque, Esfera aumenta defensa.',
          image: '/images/tutorials/formations.png'
        },
        highlight: {
          targetSelector: '#formation-selector',
          position: 'top',
          pulse: true,
          dimBackground: true
        },
        skippable: true,
        autoAdvance: false,
        canGoBack: true
      },
      {
        id: 'combat_07',
        order: 7,
        type: 'free_roam',
        content: {
          title: 'Combate Práctico',
          text: 'Experimenta con el combate. Puedes pausar en cualquier momento con ESPACIO. Intenta diferentes formaciones y objetivos.',
          image: '/images/tutorials/combat_practice.png'
        },
        skippable: true,
        autoAdvance: false,
        canGoBack: false
      }
    ],
    estimatedDuration: 10,
    difficulty: 'medium',
    requiredLevel: 3,
    replayable: true,
    completionReward: {
      resources: { credits: 10000 },
      items: ['repair_kit', 'repair_kit', 'repair_kit']
    },
    icon: '⚔️',
    category: 'combat'
  },
  
  {
    id: 'tutorial_research',
    name: 'Sistema de Investigación',
    description: 'Domina las tecnologías galácticas.',
    type: 'economy',
    trigger: { type: 'feature_unlocked', value: 'research_lab' },
    steps: [
      {
        id: 'research_01',
        order: 1,
        type: 'dialog',
        content: {
          title: 'Conocimiento es Poder',
          text: 'La investigación desbloquea nuevas tecnologías y mejoras. Cada tecnología te acerca a dominar la galaxia.',
          image: '/images/tutorials/research_intro.png',
          npcAvatar: 'scientist_chief.png',
          npcName: 'Dr. Chen'
        },
        skippable: true,
        autoAdvance: false,
        canGoBack: false
      },
      {
        id: 'research_02',
        order: 2,
        type: 'highlight',
        content: {
          title: 'Árboles de Investigación',
          text: 'Aquí están tus árboles de investigación. Cada uno mejora un aspecto diferente de tu imperio.',
          image: '/images/tutorials/research_trees.png'
        },
        highlight: {
          targetSelector: '#research-trees',
          position: 'bottom',
          pulse: true,
          dimBackground: true
        },
        skippable: true,
        autoAdvance: false,
        canGoBack: true
      },
      {
        id: 'research_03',
        order: 3,
        type: 'tooltip',
        content: {
          title: 'Ramas de Tecnología',
          text: 'El azul mejora tu economía. El rojo mejora tu combate. El verde mejora defensas. El amarillo mejora naves.',
          image: '/images/tutorials/tech_branches.png'
        },
        highlight: {
          targetSelector: '.research-tree-item',
          position: 'right',
          pulse: false,
          dimBackground: false
        },
        skippable: true,
        autoAdvance: false,
        canGoBack: true
      },
      {
        id: 'research_04',
        order: 4,
        type: 'highlight',
        content: {
          title: 'Nivel de Investigación',
          text: 'Nivel 1 desbloquea tecnologías básicas. Nivel 10 desbloquea tecnologías avanzadas. Nivel 20 desbloquea tecnologías legendarias.',
          image: '/images/tutorials/research_levels.png'
        },
        highlight: {
          targetSelector: '#research-levels',
          position: 'top',
          pulse: true,
          dimBackground: true
        },
        skippable: true,
        autoAdvance: false,
        canGoBack: true
      },
      {
        id: 'research_05',
        order: 5,
        type: 'action',
        content: {
          title: 'Iniciar Investigación',
          text: 'Selecciona una tecnología y presiona "Investigar". Las investigaciones toman tiempo pero valen la pena.',
          image: '/images/tutorials/start_research.png'
        },
        requiredAction: {
          type: 'research'
        },
        skippable: false,
        autoAdvance: false,
        canGoBack: false
      },
      {
        id: 'research_06',
        order: 6,
        type: 'tooltip',
        content: {
          title: 'Cola de Investigación',
          text: 'Puedes encolar hasta 5 investigaciones. Se completarán automáticamente en orden.',
          image: '/images/tutorials/research_queue.png'
        },
        highlight: {
          targetSelector: '#research-queue',
          position: 'left',
          pulse: true,
          dimBackground: true
        },
        skippable: true,
        autoAdvance: false,
        canGoBack: true
      }
    ],
    estimatedDuration: 8,
    difficulty: 'easy',
    requiredLevel: 3,
    replayable: true,
    completionReward: {
      resources: { credits: 5000, metal: 5000 },
      items: ['speedup_1h']
    },
    icon: '🔬',
    category: 'economy'
  }
];

// ============================================
// VIÑETAS INFORMATIVAS (INFO CARDS)
// ============================================
export interface InfoCard {
  id: string;
  title: string;
  content: string;
  image?: string;
  category: 'building' | 'ship' | 'research' | 'combat' | 'economy' | 'social';
  level: 'basic' | 'intermediate' | 'advanced';
  relatedIds?: string[];
  tips?: string[];
  warnings?: string[];
}

export const INFO_CARDS: InfoCard[] = [
  {
    id: 'info_metal_extractor',
    title: 'Extractor de Metal',
    content: 'El Extractor de Metal recolecta recursos metálicos del subsuelo planetario. Es fundamental para la construcción de edificios y naves.',
    image: '/images/buildings/metal_extractor.png',
    category: 'building',
    level: 'basic',
    relatedIds: ['info_plasma_plant', 'info_resource_management'],
    tips: [
      'Construye múltiples extractores para aumentar producción',
      'Mejora el nivel para aumentar eficiencia',
      'El metal se usa para casi todo'
    ],
    warnings: [
      'Consume energía - asegúrate de tener suficiente'
    ]
  },
  {
    id: 'info_plasma_plant',
    title: 'Planta de Plasma',
    content: 'La Planta de Plasma genera energía de plasma, recurso avanzado necesario para tecnologías de alta gama.',
    image: '/images/buildings/plasma_plant.png',
    category: 'building',
    level: 'basic',
    relatedIds: ['info_metal_extractor'],
    tips: [
      'Plasma es más valioso que metal',
      'Necesario para investigaciones avanzadas'
    ]
  },
  {
    id: 'info_solar_power',
    title: 'Generador Solar',
    content: 'El Generador Solar produce energía eléctrica básica para tus edificios. Necesario para mantener operaciones.',
    image: '/images/buildings/solar_generator.png',
    category: 'building',
    level: 'basic',
    relatedIds: ['info_metal_extractor', 'info_plasma_plant'],
    tips: [
      'Genera energía pasivamente',
      'No consume recursos para operar',
      'Mejora para más capacidad'
    ]
  },
  {
    id: 'info_command_center',
    title: 'Centro de Comando',
    content: 'El Centro de Comando es tu edificio principal. Su nivel determina qué otros edificios puedes construir.',
    image: '/images/buildings/command_center.png',
    category: 'building',
    level: 'basic',
    relatedIds: ['info_shipyard', 'info_research_lab'],
    tips: [
      'Mejora primero para desbloquear más edificios',
      'Protege este edificio a toda costa',
      'Su destrucción paraliza tu base'
    ],
    warnings: [
      'Si cae, pierdes la batalla'
    ]
  },
  {
    id: 'info_shipyard',
    title: 'Astillero',
    content: 'El Astillero te permite construir naves espaciales. Mejorarlo desbloquea nuevos tipos de naves.',
    image: '/images/buildings/shipyard.png',
    category: 'building',
    level: 'basic',
    relatedIds: ['info_command_center'],
    tips: [
      'Necesario para construir cualquier nave',
      'Cada nivel desbloquea nuevas naves',
      'Múltiples astilleros aceleran producción'
    ]
  },
  {
    id: 'info_research_lab',
    title: 'Laboratorio de Investigación',
    content: 'El Laboratorio permite investigar tecnologías que mejoran todos los aspectos de tu imperio.',
    image: '/images/buildings/research_lab.png',
    category: 'building',
    level: 'basic',
    relatedIds: ['info_command_center'],
    tips: [
      'Investiga continuamente',
      'Prioriza tecnologías que necesites',
      'No puedes pausar investigaciones'
    ]
  },
  {
    id: 'info_frigate',
    title: 'Fragata',
    content: 'Las fragatas son naves pequeñas, rápidas y económicas. Ideales para exploración y combate temprano.',
    image: '/images/ships/frigate.png',
    category: 'ship',
    level: 'basic',
    relatedIds: ['info_cruiser', 'info_battleship'],
    tips: [
      'Baratas de producir en masa',
      'Rápidas pero débiles',
      'Buenas contra bombarderos'
    ],
    warnings: [
      'No envíes solas contra naves grandes'
    ]
  },
  {
    id: 'info_cruiser',
    title: 'Crucero',
    content: 'Los cruceros son naves balanceadas con buena capacidad ofensiva y defensiva. El backbone de cualquier flota.',
    image: '/images/ships/cruiser.png',
    category: 'ship',
    level: 'intermediate',
    relatedIds: ['info_frigate', 'info_battleship'],
    tips: [
      'Balance perfecto costo/beneficio',
      'Versátiles en cualquier rol'
    ]
  },
  {
    id: 'info_battleship',
    title: 'Acorazado',
    content: 'Los acorazados son naves pesadas con enorme poder de fuego y defensa. Ideales para liderar flotas.',
    image: '/images/ships/battleship.png',
    category: 'ship',
    level: 'intermediate',
    relatedIds: ['info_cruiser', 'info_dreadnought'],
    tips: [
      'Mucha salud y daño',
      'Lentos pero poderosos',
      'Núcleo de cualquier flota seria'
    ],
    warnings: [
      'Caros y lentos de construir'
    ]
  },
  {
    id: 'info_weapon_types',
    title: 'Tipos de Armas',
    content: 'Existen tres tipos de armas: Balísticas (kinetic), Direccionales (energy), y Misiles. Cada tipo tiene fortalezas y debilidades.',
    image: '/images/combat/weapon_types.png',
    category: 'combat',
    level: 'intermediate',
    tips: [
      'Balísticas: Buen daño sostenido, resisten escudos',
      'Direccionales: Alto daño, corto alcance, atraviesan armadura',
      'Misiles: Daño explosivo, largo alcance, pueden ser interceptados'
    ]
  },
  {
    id: 'info_shield_system',
    title: 'Sistema de Escudos',
    content: 'Los escudos absorben daño antes de que afecten al casco. Recargan lentamente después del combate.',
    image: '/images/combat/shield_system.png',
    category: 'combat',
    level: 'intermediate',
    tips: [
      'Escudos regeneran entre batallas',
      'Las armas balísticas dañan más escudos',
      'Prioriza escudos en naves valiosas'
    ]
  },
  {
    id: 'info_commanders',
    title: 'Sistema de Comandantes',
    content: 'Los comandantes lideran tus flotas y otorgan bonus significativos. Pueden equiparse con Gems y Bionic Chips.',
    image: '/images/commanders/system_overview.png',
    category: 'combat',
    level: 'intermediate',
    tips: [
      'Comandantes legendarios son mucho más poderosos',
      'Las Gems aumentan stats específicos',
      'Fusiona comandantes para subirlos de rareza'
    ]
  },
  {
    id: 'info_fleet_formation',
    title: 'Formaciones de Flota',
    content: 'Las formaciones tácticas otorgan bonus a tu flota. La formación correcta puede decidir la batalla.',
    image: '/images/combat/formations.png',
    category: 'combat',
    level: 'advanced',
    tips: [
      'Cuña: Bonus de ataque',
      'Esfera: Bonus defensivo',
      'Línea: Bonus de precisión'
    ]
  },
  {
    id: 'info_honor_points',
    title: 'Puntos de Honor',
    content: 'El honor se gana en combate PvP y se usa para comprar items exclusivos en la tienda de honor.',
    image: '/images/economy/honor_system.png',
    category: 'economy',
    level: 'basic',
    tips: [
      'Gana honor venciendo oponentes en Arena',
      'Usa honor para comprar blueprints raros',
      'Pierdes honor si huyes de combate'
    ]
  },
  {
    id: 'info_resource_management',
    title: 'Gestión de Recursos',
    content: 'Administra metal, plasma y créditos sabiamente. El balance es clave para el crecimiento.',
    image: '/images/economy/resources.png',
    category: 'economy',
    level: 'basic',
    relatedIds: ['info_metal_extractor', 'info_plasma_plant'],
    tips: [
      'Nunca dejes de recolectar',
      'Invesa en producción temprano',
      'Guarda reservas para emergencias'
    ]
  },
  {
    id: 'info_corp_system',
    title: 'Sistema de Corporaciones',
    content: 'Las corporaciones son alianzas de jugadores que comparten tecnologías, recursos y luchan juntos.',
    image: '/images/social/corporation.png',
    category: 'social',
    level: 'intermediate',
    tips: [
      'Únete a una corp activa',
      'Participa en misiones de corp',
      'Dona recursos para tecnologías de corp'
    ]
  },
  {
    id: 'info_research_tree',
    title: 'Árbol de Tecnologías',
    content: 'El sistema de investigación tiene múltiples ramas: militar, económica, industrial y científica.',
    image: '/images/research/tech_tree.png',
    category: 'research',
    level: 'intermediate',
    tips: [
      'Militar: Mejora combate',
      'Económica: Más recursos',
      'Industrial: Mejor construcción',
      'Científica: Desbloqueos avanzados'
    ]
  },
  {
    id: 'info_planet_types',
    title: 'Tipos de Planetas',
    content: 'Cada tipo de planeta tiene ventajas únicas. Coloniza según tu estrategia.',
    image: '/images/planets/types.png',
    category: 'research',
    level: 'basic',
    tips: [
      'Terrestres: Balanceado',
      'Lava: Bonus metal',
      'Hielo: Bonus energía',
      'Gas: Bonus plasma'
    ]
  }
];

// ============================================
// TOOLTIPS CONTEXTUALES
// ============================================
export interface ContextualTooltip {
  id: string;
  trigger: 'hover' | 'click' | 'first_visit' | 'condition';
  target: string;
  content: string;
  title?: string;
  image?: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  showOnce: boolean;
  condition?: string;
  delay?: number;
}

export const CONTEXTUAL_TOOLTIPS: ContextualTooltip[] = [
  {
    id: 'tooltip_build_button',
    trigger: 'hover',
    target: '#build-button',
    content: 'Haz clic para abrir el menú de construcción',
    position: 'bottom',
    showOnce: false
  },
  {
    id: 'tooltip_resources_low',
    trigger: 'condition',
    target: '#resource-panel',
    title: '¡Recursos Bajos!',
    content: 'Tus recursos están por debajo del 20%. Considera recolectar o construir más extractores.',
    position: 'bottom',
    showOnce: true,
    condition: 'resources < 20%',
    delay: 2000
  },
  {
    id: 'tooltip_research_complete',
    trigger: 'condition',
    target: '#research-button',
    title: '¡Investigación Completa!',
    content: 'Una investigación ha terminado. Reclama tus recompensas.',
    position: 'left',
    showOnce: false,
    condition: 'research_completed',
    delay: 500
  },
  {
    id: 'tooltip_new_quest',
    trigger: 'condition',
    target: '#quest-button',
    title: 'Nueva Misión',
    content: 'Tienes una nueva misión disponible.',
    position: 'left',
    showOnce: false,
    condition: 'quest_available',
    delay: 0
  }
];

// ============================================
// SISTEMA DE DIFICULTAD
// ============================================
export interface DifficultyPreset {
  id: string;
  name: string;
  description: string;
  modifiers: {
    enemyHealth: number;
    enemyDamage: number;
    enemySpeed: number;
    resourceGain: number;
    buildSpeed: number;
    researchSpeed: number;
    xpGain: number;
    deathPenalty: number;
  };
  recommended: boolean;
}

export const DIFFICULTY_PRESETS: DifficultyPreset[] = [
  {
    id: 'diff_casual',
    name: 'Casual',
    description: 'Para disfrutar la historia sin estrés. Enemigos débiles, recursos abundantes.',
    modifiers: {
      enemyHealth: 0.7,
      enemyDamage: 0.6,
      enemySpeed: 0.8,
      resourceGain: 1.5,
      buildSpeed: 1.3,
      researchSpeed: 1.3,
      xpGain: 1.2,
      deathPenalty: 0.5
    },
    recommended: false
  },
  {
    id: 'diff_normal',
    name: 'Normal',
    description: 'Experiencia balanceada. Desafío moderado.',
    modifiers: {
      enemyHealth: 1.0,
      enemyDamage: 1.0,
      enemySpeed: 1.0,
      resourceGain: 1.0,
      buildSpeed: 1.0,
      researchSpeed: 1.0,
      xpGain: 1.0,
      deathPenalty: 1.0
    },
    recommended: true
  },
  {
    id: 'diff_hard',
    name: 'Difícil',
    description: 'Enemigos más inteligentes y peligrosos. Requiere estrategia.',
    modifiers: {
      enemyHealth: 1.3,
      enemyDamage: 1.4,
      enemySpeed: 1.1,
      resourceGain: 0.8,
      buildSpeed: 0.9,
      researchSpeed: 0.9,
      xpGain: 1.2,
      deathPenalty: 1.5
    },
    recommended: false
  },
  {
    id: 'diff_insane',
    name:'Insane',
    description: 'Solo para veteranos. Un error y estás acabado.',
    modifiers: {
      enemyHealth: 2.0,
      enemyDamage: 2.0,
      enemySpeed: 1.3,
      resourceGain: 0.5,
      buildSpeed: 0.7,
      researchSpeed: 0.7,
      xpGain: 2.0,
      deathPenalty: 2.0
    },
    recommended: false
  }
];

// ============================================
// HELPERS
// ============================================
export function getTutorialById(id: string): Tutorial | undefined {
  return MAIN_TUTORIALS.find(t => t.id === id);
}

export function getTutorialsByType(type: TutorialType): Tutorial[] {
  return MAIN_TUTORIALS.filter(t => t.type === type);
}

export function getAvailableTutorials(playerLevel: number): Tutorial[] {
  return MAIN_TUTORIALS.filter(t => t.requiredLevel <= playerLevel);
}

export function getInfoCardById(id: string): InfoCard | undefined {
  return INFO_CARDS.find(c => c.id === id);
}

export function getInfoCardsByCategory(category: InfoCard['category']): InfoCard[] {
  return INFO_CARDS.filter(c => c.category === category);
}

export function getDifficultyPreset(id: string): DifficultyPreset | undefined {
  return DIFFICULTY_PRESETS.find(d => d.id === id);
}

export function calculateDifficultyModifiers(
  basePreset: DifficultyPreset,
  playerAdjustments: Partial<DifficultyPreset['modifiers']>
): DifficultyPreset['modifiers'] {
  return {
    ...basePreset.modifiers,
    ...playerAdjustments
  };
}

export const TutorialSystem = {
  MAIN_TUTORIALS,
  INFO_CARDS,
  CONTEXTUAL_TOOLTIPS,
  DIFFICULTY_PRESETS,
  getTutorialById,
  getTutorialsByType,
  getAvailableTutorials,
  getInfoCardById,
  getInfoCardsByCategory,
  getDifficultyPreset,
  calculateDifficultyModifiers
};
