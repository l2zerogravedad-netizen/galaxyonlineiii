/**
 * SISTEMA DE TUTORIAL Y AYUDA - GALAXY ONLINE II
 * Tutoriales interactivos, guías, sistema de ayuda
 */

// ============================================
// TIPOS DE TUTORIALES
// ============================================
export type TutorialType = 
  | 'basic'            // Tutorial básico inicial
  | 'advanced'         // Tutorial avanzado
  | 'feature'          // Tutorial de característica específica
  | 'combat'           // Tutorial de combate
  | 'economy'          // Tutorial de economía
  | 'social'           // Tutorial social
  | 'exploration'      // Tutorial de exploración
  | 'building'         // Tutorial de construcción
  | 'research'         // Tutorial de investigación
  | 'diplomacy'        // Tutorial de diplomacia
  | 'pvp'              // Tutorial PvP
  | 'events'           // Tutorial de eventos
  | 'custom';          // Tutorial personalizado

export type TutorialDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// ============================================
// PASO DE TUTORIAL
// ============================================
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  
  // Contenido
  content: {
    text?: string;
    image?: string;
    video?: {
      url: string;
      duration: number;
      autoplay: boolean;
    };
    interactive?: {
      type: 'click' | 'drag' | 'input' | 'select' | 'minigame';
      target: string; // selector CSS o ID del elemento
      required: boolean;
    };
    
    // Highlight
    highlight?: {
      element: string;
      style: 'glow' | 'pulse' | 'border' | 'arrow';
      color: string;
      size: number;
    };
  };
  
  // Navegación
  navigation: {
    canSkip: boolean;
    canGoBack: boolean;
    autoAdvance: boolean;
    timeout?: number; // segundos para auto-avanzar
  };
  
  // Requisitos
  requirements?: {
    level?: number;
    completedSteps?: string[];
    itemsOwned?: string[];
    buildingsBuilt?: string[];
  };
  
  // Verificación
  verification?: {
    type: 'click' | 'input' | 'timer' | 'custom';
    target?: string;
    expectedValue?: any;
    customFunction?: string; // nombre de función
  };
  
  // Recompensas
  rewards?: {
    experience?: number;
    currency?: number;
    items?: string[];
    unlocks?: string[];
  };
  
  // Estado
  status: {
    completed: boolean;
    skipped: boolean;
    startTime?: number;
    completionTime?: number;
    attempts: number;
  };
}

// ============================================
// TUTORIAL COMPLETO
// ============================================
export interface Tutorial {
  id: string;
  name: string;
  description: string;
  
  // Metadatos
  metadata: {
    type: TutorialType;
    difficulty: TutorialDifficulty;
    category: string;
    tags: string[];
    
    // Audiencia
    targetAudience: 'new_players' | 'returning_players' | 'veterans' | 'all';
    
    // Tiempo estimado
    estimatedDuration: number; // minutos
    
    // Prerrequisitos
    prerequisites: {
      level?: number;
      tutorials?: string[];
      features?: string[];
    };
    
    // Versión
    version: string;
    lastUpdated: number;
    
    // Autores
    authors: {
      name: string;
      role: string;
    }[];
  };
  
  // Pasos
  steps: TutorialStep[];
  
  // Configuración
  config: {
    // Disponibilidad
    autoStart: boolean;
    repeatable: boolean;
    required: boolean;
    
    // Interrupción
    canPause: boolean;
    canResume: boolean;
    saveProgress: boolean;
    
    // Interfaz
    showProgress: boolean;
    allowSkip: boolean;
    showHints: boolean;
    
    // Modo
    mode: 'modal' | 'overlay' | 'sidebar' | 'full_screen';
  };
  
  // Progreso
  progress: {
    started: boolean;
    startTime?: number;
    currentStep: number;
    completed: boolean;
    completionTime?: number;
    
    // Estadísticas
    totalAttempts: number;
    averageCompletionTime: number;
    completionRate: number;
    
    // Paso actual
    stepProgress: Record<string, {
      started: boolean;
      completed: boolean;
      skipped: boolean;
      timeSpent: number;
      attempts: number;
    }>;
  };
  
  // Localización
  localization: {
    availableLanguages: string[];
    defaultLanguage: string;
    translations: Partial<Record<string, {
      name: string;
      description: string;
      steps: Partial<Record<string, {
        title: string;
        description: string;
        text?: string;
      }>>;
    }>>;
  };
}

// ============================================
// SISTEMA DE AYUDA CONTEXTUAL
// ============================================
export interface HelpTopic {
  id: string;
  title: string;
  category: string;
  
  // Contenido
  content: {
    summary: string;
    body: string; // HTML o Markdown
    
    // Secciones
    sections: {
      title: string;
      content: string;
      type: 'text' | 'image' | 'video' | 'table' | 'list';
      media?: string[];
    }[];
    
    // FAQ
    faq: {
      question: string;
      answer: string;
      helpful: number;
      notHelpful: number;
    }[];
    
    // Relacionados
    relatedTopics: string[];
    relatedTutorials: string[];
  };
  
  // Metadatos
  metadata: {
    keywords: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    readingTime: number; // minutos
    lastUpdated: number;
    
    // Relevancia
    relevanceScore: number;
    viewCount: number;
    helpfulRating: number;
  };
  
  // Contexto
  context: {
    // Donde aparece esta ayuda
    triggers: {
      screen?: string;
      feature?: string;
      action?: string;
      level?: number;
    }[];
    
    // Auto-aparición
    autoShow: boolean;
    priority: number;
  };
}

// ============================================
// SISTEMA DE GUIAS INTERACTIVAS
// ============================================
export interface InteractiveGuide {
  id: string;
  name: string;
  description: string;
  
  // Tipo de guía
  type: 'step_by_step' | 'checklist' | 'simulation' | 'quiz' | 'interactive';
  
  // Contenido
  content: {
    introduction: string;
    objectives: string[];
    
    // Pasos o secciones
    sections: {
      id: string;
      title: string;
      content: string;
      
      // Interactividad
      interactive?: {
        type: 'demo' | 'practice' | 'quiz' | 'simulation';
        data: any;
        validation?: {
          type: 'auto' | 'manual';
          criteria: any;
        };
      };
      
      // Media
      media?: {
        type: 'image' | 'video' | 'animation';
        url: string;
        caption?: string;
      }[];
      
      // Tips
      tips?: {
        icon: string;
        text: string;
        type: 'info' | 'warning' | 'tip' | 'pro';
      }[];
    }[];
    
    // Conclusión
    conclusion: string;
    nextSteps?: string[];
  };
  
  // Progreso
  progress: {
    started: boolean;
    startTime?: number;
    currentSection: number;
    completed: boolean;
    completionTime?: number;
    
    // Sección progreso
    sectionProgress: Record<string, {
      completed: boolean;
      timeSpent: number;
      score?: number;
    }>;
  };
  
  // Configuración
  config: {
    allowSkip: boolean;
    showProgress: boolean;
    saveProgress: boolean;
    timeLimit?: number; // minutos
  };
}

// ============================================
// SISTEMA DE SUGERENCIAS INTELIGENTES
// ============================================
export interface SmartSuggestion {
  id: string;
  
  // Contexto del jugador
  playerContext: {
    level: number;
    progress: {
      completedTutorials: string[];
      unlockedFeatures: string[];
      currentGoals: string[];
    };
    
    // Comportamiento
    behavior: {
      lastActions: string[];
      timePlayed: number;
      sessionCount: number;
      preferences: Record<string, any>;
    };
    
    // Estado del juego
    gameState: {
      currentScreen?: string;
      activeFeatures: string[];
      availableActions: string[];
      resources: Record<string, number>;
    };
  };
  
  // Sugerencia
  suggestion: {
    type: 'tutorial' | 'tip' | 'feature' | 'reminder' | 'optimization';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    
    // Contenido
    content: {
      text?: string;
      tutorialId?: string;
      helpTopicId?: string;
      guideId?: string;
    };
    
    // Acción
    action: {
      label: string;
      type: 'open_tutorial' | 'open_help' | 'open_guide' | 'dismiss' | 'remind_later';
      data?: Record<string, any>;
    };
  };
  
  // Lógica
  logic: {
    // Condiciones para mostrar
    conditions: {
      type: 'and' | 'or';
      rules: {
        field: string;
        operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
        value: any;
      }[];
    };
    
    // Cooldown
    cooldown: {
      type: 'time' | 'sessions' | 'actions';
      value: number;
      lastShown?: number;
    };
    
    // Límite de visualizaciones
    maxShowings: number;
    currentShowings: number;
  };
  
  // Estado
  status: {
    active: boolean;
    created: number;
    lastShown?: number;
    dismissed: boolean;
    dismissedAt?: number;
    accepted: boolean;
    acceptedAt?: number;
  };
}

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================
export interface TutorialSystemConfig {
  // General
  general: {
    autoStartTutorial: boolean;
    requiredTutorialCompletion: boolean;
    allowTutorialSkip: boolean;
    saveProgress: boolean;
  };
  
  // Interfaz
  interface: {
    defaultMode: 'modal' | 'overlay';
    showProgress: boolean;
    showHints: boolean;
    highlightElements: boolean;
    autoAdvanceDelay: number; // segundos
  };
  
  // Sugerencias
  suggestions: {
    enabled: boolean;
    maxActiveSuggestions: number;
    suggestionInterval: number; // minutos
    respectUserPreferences: boolean;
  };
  
  // Ayuda contextual
  contextualHelp: {
    enabled: boolean;
    autoShow: boolean;
    showOnHover: boolean;
    delayBeforeShow: number; // milisegundos
  };
  
  // Progreso
  progress: {
    trackDetailedStats: boolean;
    allowPartialCompletion: boolean;
    resetOnNewGame: boolean;
    syncAcrossDevices: boolean;
  };
}

// ============================================
// TUTORIALES PREDEFINIDOS
// ============================================
export const BASIC_TUTORIAL: Tutorial = {
  id: 'tutorial_basic_intro',
  name: 'Bienvenido a Galaxy Online II',
  description: 'Tutorial básico para nuevos jugadores',
  metadata: {
    type: 'basic',
    difficulty: 'beginner',
    category: 'introduccion',
    tags: ['nuevo', 'basico', 'introduccion'],
    targetAudience: 'new_players',
    estimatedDuration: 15,
    prerequisites: {},
    version: '1.0.0',
    lastUpdated: Date.now(),
    authors: [
      { name: 'Equipo de Diseño', role: 'Game Designer' }
    ]
  },
  steps: [
    {
      id: 'step_welcome',
      title: 'Bienvenido Comandante',
      description: 'Te damos la bienvenida a Galaxy Online II',
      content: {
        text: 'En este tutorial aprenderás los conceptos básicos del juego.',
        image: '/images/tutorial/welcome.jpg'
      },
      navigation: {
        canSkip: false,
        canGoBack: false,
        autoAdvance: false
      },
      status: {
        completed: false,
        skipped: false,
        attempts: 0
      }
    },
    {
      id: 'step_interface',
      title: 'Interfaz Principal',
      description: 'Conoce los elementos principales de la interfaz',
      content: {
        text: 'La interfaz se divide en varias áreas principales...',
        highlight: {
          element: '.main-interface',
          style: 'glow',
          color: '#4A90E2',
          size: 2
        }
      },
      navigation: {
        canSkip: true,
        canGoBack: true,
        autoAdvance: false
      },
      status: {
        completed: false,
        skipped: false,
        attempts: 0
      }
    },
    {
      id: 'step_first_building',
      title: 'Tu Primera Construcción',
      description: 'Aprende a construir tu primer edificio',
      content: {
        text: 'Haz clic en el botón de construcción para comenzar.',
        interactive: {
          type: 'click',
          target: '.build-button',
          required: true
        },
        highlight: {
          element: '.build-button',
          style: 'pulse',
          color: '#FF6B6B',
          size: 3
        }
      },
      verification: {
        type: 'click',
        target: '.build-button'
      },
      navigation: {
        canSkip: true,
        canGoBack: true,
        autoAdvance: false
      },
      rewards: {
        experience: 100,
        currency: 500
      },
      status: {
        completed: false,
        skipped: false,
        attempts: 0
      }
    }
  ],
  config: {
    autoStart: true,
    repeatable: false,
    required: true,
    canPause: true,
    canResume: true,
    saveProgress: true,
    showProgress: true,
    allowSkip: false,
    showHints: true,
    mode: 'modal'
  },
  progress: {
    started: false,
    currentStep: 0,
    completed: false,
    totalAttempts: 0,
    averageCompletionTime: 0,
    completionRate: 0,
    stepProgress: {}
  },
  localization: {
    availableLanguages: ['es', 'en', 'de', 'fr'],
    defaultLanguage: 'es',
    translations: {}
  }
};

// ============================================
// HELPERS
// ============================================
export function createTutorial(
  name: string,
  description: string,
  type: TutorialType,
  difficulty: TutorialDifficulty
): Tutorial {
  return {
    id: `tutorial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    metadata: {
      type,
      difficulty,
      category: 'general',
      tags: [],
      targetAudience: 'all',
      estimatedDuration: 10,
      prerequisites: {},
      version: '1.0.0',
      lastUpdated: Date.now(),
      authors: []
    },
    steps: [],
    config: {
      autoStart: false,
      repeatable: false,
      required: false,
      canPause: true,
      canResume: true,
      saveProgress: true,
      showProgress: true,
      allowSkip: true,
      showHints: true,
      mode: 'modal'
    },
    progress: {
      started: false,
      currentStep: 0,
      completed: false,
      totalAttempts: 0,
      averageCompletionTime: 0,
      completionRate: 0,
      stepProgress: {}
    },
    localization: {
      availableLanguages: ['es'],
      defaultLanguage: 'es',
      translations: {}
    }
  };
}

export function addTutorialStep(
  tutorial: Tutorial,
  title: string,
  description: string,
  content: TutorialStep['content']
): Tutorial {
  const step: TutorialStep = {
    id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    description,
    content,
    navigation: {
      canSkip: true,
      canGoBack: true,
      autoAdvance: false
    },
    status: {
      completed: false,
      skipped: false,
      attempts: 0
    }
  };
  
  return {
    ...tutorial,
    steps: [...tutorial.steps, step]
  };
}

export function startTutorial(tutorial: Tutorial): Tutorial {
  return {
    ...tutorial,
    progress: {
      ...tutorial.progress,
      started: true,
      startTime: Date.now(),
      currentStep: 0,
      stepProgress: tutorial.steps.reduce((acc, step) => ({
        ...acc,
        [step.id]: {
          started: false,
          completed: false,
          skipped: false,
          timeSpent: 0,
          attempts: 0
        }
      }), {})
    }
  };
}

export function completeTutorialStep(tutorial: Tutorial, stepId: string): Tutorial {
  const stepIndex = tutorial.steps.findIndex(step => step.id === stepId);
  if (stepIndex === -1) return tutorial;
  
  return {
    ...tutorial,
    steps: tutorial.steps.map(step => 
      step.id === stepId 
        ? {
            ...step,
            status: {
              ...step.status,
              completed: true,
              completionTime: Date.now()
            }
          }
        : step
    ),
    progress: {
      ...tutorial.progress,
      currentStep: Math.min(tutorial.progress.currentStep + 1, tutorial.steps.length - 1),
      stepProgress: {
        ...tutorial.progress.stepProgress,
        [stepId]: {
          ...tutorial.progress.stepProgress[stepId],
          completed: true,
          timeSpent: Date.now() - (tutorial.progress.startTime || Date.now())
        }
      }
    }
  };
}

export function isTutorialCompleted(tutorial: Tutorial): boolean {
  return tutorial.progress.completed || 
         tutorial.steps.every(step => step.status.completed);
}

export function getTutorialProgress(tutorial: Tutorial): number {
  const completedSteps = tutorial.steps.filter(step => step.status.completed).length;
  return (completedSteps / tutorial.steps.length) * 100;
}

export function getAvailableTutorials(
  allTutorials: Tutorial[],
  playerLevel: number,
  completedTutorials: string[] = []
): Tutorial[] {
  return allTutorials.filter(tutorial => {
    // Verificar prerrequisitos
    if (tutorial.metadata.prerequisites.level && 
        playerLevel < tutorial.metadata.prerequisites.level) {
      return false;
    }
    
    if (tutorial.metadata.prerequisites.tutorials && tutorial.metadata.prerequisites.tutorials.length > 0) {
      const hasPrerequisites = tutorial.metadata.prerequisites.tutorials
        .every(prereq => completedTutorials.includes(prereq));
      if (!hasPrerequisites) return false;
    }
    
    // No mostrar tutoriales ya completados si no son repetibles
    if (!tutorial.config.repeatable && completedTutorials.includes(tutorial.id)) {
      return false;
    }
    
    return true;
  });
}

export function createHelpTopic(
  title: string,
  category: string,
  summary: string,
  body: string
): HelpTopic {
  return {
    id: `help_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    category,
    content: {
      summary,
      body,
      sections: [],
      faq: [],
      relatedTopics: [],
      relatedTutorials: []
    },
    metadata: {
      keywords: [],
      difficulty: 'beginner',
      readingTime: Math.ceil(body.split(/\s+/).length / 200),
      lastUpdated: Date.now(),
      relevanceScore: 0,
      viewCount: 0,
      helpfulRating: 0
    },
    context: {
      triggers: [],
      autoShow: false,
      priority: 0
    }
  };
}

export function searchHelpTopics(
  topics: HelpTopic[],
  query: string,
  category?: string
): HelpTopic[] {
  const normalizedQuery = query.toLowerCase();
  
  return topics.filter(topic => {
    // Filtrar por categoría si se especifica
    if (category && topic.category !== category) {
      return false;
    }
    
    // Buscar en título, resumen y palabras clave
    const titleMatch = topic.title.toLowerCase().includes(normalizedQuery);
    const summaryMatch = topic.content.summary.toLowerCase().includes(normalizedQuery);
    const keywordMatch = topic.metadata.keywords.some(keyword => 
      keyword.toLowerCase().includes(normalizedQuery)
    );
    
    return titleMatch || summaryMatch || keywordMatch;
  }).sort((a, b) => {
    // Ordenar por relevancia
    const aScore = a.metadata.relevanceScore + a.metadata.viewCount * 0.1;
    const bScore = b.metadata.relevanceScore + b.metadata.viewCount * 0.1;
    return bScore - aScore;
  });
}

export const TutorialSystem = {
  BASIC_TUTORIAL,
  createTutorial,
  addTutorialStep,
  startTutorial,
  completeTutorialStep,
  isTutorialCompleted,
  getTutorialProgress,
  getAvailableTutorials,
  createHelpTopic,
  searchHelpTopics
};
