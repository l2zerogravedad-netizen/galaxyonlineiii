/**
 * SISTEMA DE GUÍAS COMUNITARIAS - GALAXY ONLINE II
 * Wiki integrada, guías de usuarios, votaciones
 */

// ============================================
// TIPOS DE GUÍAS
// ============================================
export type GuideType = 
  | 'tutorial'       // Tutorial básico
  | 'strategy'       // Estrategia avanzada
  | 'mechanic'       // Explicación de mecánicas
  | 'build'          // Guía de builds
  | 'walkthrough'    // Walkthrough completo
  | 'reference'      // Referencia rápida
  | 'faq'            // Preguntas frecuentes
  | 'lore'           // Lore y historia
  | 'mod';           // Guía de mods

export type GuideDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// ============================================
// GUÍA
// ============================================
export interface Guide {
  id: string;
  title: string;
  type: GuideType;
  difficulty: GuideDifficulty;
  
  // Autor
  author: {
    id: string;
    name: string;
    reputation: number;
    guidesCount: number;
    verified: boolean;
  };
  
  // Contenido
  content: {
    summary: string;
    sections: GuideSection[];
    tags: string[];
    language: string;
    lastUpdated: number;
    version: string;
  };
  
  // Metadatos
  metadata: {
    createdAt: number;
    lastUpdated: number;
    readTime: number; // minutos estimados
    wordCount: number;
    viewCount: number;
    uniqueViews: number;
  };
  
  // Valoración
  ratings: {
    average: number; // 0-5
    count: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
    helpfulVotes: number;
    unhelpfulVotes: number;
  };
  
  // Estado
  status: {
    published: boolean;
    featured: boolean;
    verified: boolean;
    outdated: boolean;
    underReview: boolean;
    deprecated: boolean;
  };
  
  // Interacción
  interaction: {
    comments: number;
    bookmarks: number;
    shares: number;
    downloads: number;
    translations: string[];
  };
  
  // Relacionado con el juego
  gameVersion: string;
  applicableFactions?: string[];
  applicableModes?: string[];
}

// ============================================
// SECCIÓN DE GUÍA
// ============================================
export interface GuideSection {
  id: string;
  title: string;
  order: number;
  
  // Contenido
  content: string;
  format: 'text' | 'markdown' | 'html';
  
  // Media
  media: {
    images: { url: string; caption: string; alt: string }[];
    videos: { url: string; title: string; duration: number }[];
    diagrams: { type: string; data: string; caption: string }[];
  };
  
  // Características especiales
  features: {
    collapsible: boolean;
    spoilerWarning: boolean;
    interactive: boolean;
    quiz?: QuizQuestion[];
    calculator?: CalculatorWidget;
  };
  
  // Vinculación
  links: {
    internal: { sectionId: string; text: string }[];
    external: { url: string; text: string }[];
    relatedGuides: string[];
  };
}

// ============================================
// PREGUNTA DE QUIZ
// ============================================
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// ============================================
// CALCULADORA
// ============================================
export interface CalculatorWidget {
  id: string;
  name: string;
  description: string;
  
  inputs: {
    id: string;
    label: string;
    type: 'number' | 'select' | 'checkbox';
    default?: number | string | boolean;
    options?: string[];
    min?: number;
    max?: number;
  }[];
  
  formula: string;
  
  outputs: {
    id: string;
    label: string;
    unit?: string;
    format?: 'number' | 'percentage' | 'time' | 'currency';
  }[];
}

// ============================================
// SISTEMA DE VOTACIONES
// ============================================
export interface VotingSystem {
  // Votación de guías
  guideVoting: {
    vote(id: string, rating: 1 | 2 | 3 | 4 | 5, userId: string): void;
    markHelpful(id: string, userId: string, helpful: boolean): void;
    getUserVote(id: string, userId: string): number | null;
  };
  
  // Votaciones comunitarias
  communityPolls: CommunityPoll[];
  
  // Destacados
  featured: {
    method: 'algorithm' | 'manual' | 'hybrid';
    criteria: {
      minRating: number;
      minVotes: number;
      maxAge: number;
      authorReputation: number;
    };
    rotation: number; // días
  };
}

// ============================================
// VOTACIÓN COMUNITARIA
// ============================================
export interface CommunityPoll {
  id: string;
  title: string;
  description: string;
  
  // Autor
  author: {
    id: string;
    name: string;
    reputation: number;
  };
  
  // Opciones
  options: {
    id: string;
    text: string;
    description?: string;
    votes: number;
    percentage: number;
  }[];
  
  // Configuración
  config: {
    multipleChoice: boolean;
    allowOther: boolean;
    anonymous: boolean;
    duration: number; // segundos
    minReputationToVote: number;
  };
  
  // Estado
  status: {
    active: boolean;
    startTime: number;
    endTime: number;
    totalVotes: number;
    uniqueVoters: number;
  };
  
  // Resultados
  results: {
    winner?: string;
    voteDistribution: Record<string, number>;
    demographics?: Record<string, Record<string, number>>;
  };
}

// ============================================
// WIKI INTEGRADA
// ============================================
// ============================================
// CAMBIO EN WIKI
// ============================================
export interface WikiChange {
  id: string;
  type: 'edit' | 'create' | 'delete' | 'move';
  pageId: string;
  pageTitle: string;
  userId: string;
  username: string;
  timestamp: number;
  summary: string;
  sizeDiff: number;
}

export interface GameWiki {
  // Estructura
  structure: {
    categories: WikiCategory[];
    tags: string[];
    recentChanges: WikiChange[];
    popularPages: string[];
  };
  
  // Artículos
  articles: WikiArticle[];
  
  // Búsqueda
  search: {
    index: Record<string, string[]>;
    suggestions: string[];
    filters: {
      category: string[];
      tag: string[];
      author: string[];
      lastUpdated: 'day' | 'week' | 'month' | 'year';
    };
  };
  
  // Colaboración
  collaboration: {
    editors: WikiEditor[];
    editHistory: WikiEditHistory;
    moderationQueue: WikiModerationQueue;
    rewards: WikiRewards;
  };
}

// ============================================
// CATEGORÍA WIKI
// ============================================
export interface WikiCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  parent?: string;
  children: string[];
  articles: string[];
  order: number;
}

// ============================================
// ARTÍCULO WIKI
// ============================================
export interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  
  // Contenido
  content: {
    sections: WikiSection[];
    infobox?: WikiInfobox;
    references: WikiReference[];
    related: string[];
  };
  
  // Categorización
  categories: string[];
  tags: string[];
  gameVersion: string;
  
  // Estado
  status: {
    stub: boolean;
    outdated: boolean;
    needsImages: boolean;
    needsVerification: boolean;
    protected: boolean;
    featured: boolean;
  };
  
  // Estadísticas
  stats: {
    views: number;
    edits: number;
    editors: number;
    lastEdit: number;
    createdAt: number;
  };
}

// ============================================
// SECCIÓN WIKI
// ============================================
export interface WikiSection {
  id: string;
  title: string;
  level: number; // 1-6 (h1-h6)
  content: string;
  anchor: string;
}

// ============================================
// INFOBOX
// ============================================
export interface WikiInfobox {
  type: string;
  image?: string;
  data: { label: string; value: string; link?: string }[];
}

// ============================================
// REFERENCIA
// ============================================
export interface WikiReference {
  id: string;
  type: 'guide' | 'official' | 'external' | 'community';
  title: string;
  url?: string;
  author?: string;
  date?: number;
}

// ============================================
// EDITOR WIKI
// ============================================
export interface WikiEditor {
  id: string;
  name: string;
  reputation: number;
  contributions: {
    articles: number;
    edits: number;
    guides: number;
    votes: number;
  };
  badges: string[];
  joinedAt: number;
  lastActive: number;
}

// ============================================
// HISTORIAL DE EDICIONES
// ============================================
export interface WikiEditHistory {
  articleId: string;
  edits: {
    id: string;
    editor: string;
    timestamp: number;
    summary: string;
    diff: string;
    size: number;
    reverted: boolean;
    revertReason?: string;
  }[];
}

// ============================================
// MODERACIÓN
// ============================================
export interface WikiModerationQueue {
  pending: {
    id: string;
    type: 'edit' | 'new_article' | 'upload' | 'report';
    content: string;
    submittedBy: string;
    submittedAt: number;
    priority: 'low' | 'medium' | 'high';
  }[];
  
  reports: {
    id: string;
    targetType: 'article' | 'guide' | 'comment' | 'user';
    targetId: string;
    reason: string;
    reportedBy: string;
    reportedAt: number;
    status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  }[];
}

// ============================================
// RECOMPENSAS WIKI
// ============================================
export interface WikiRewards {
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    requirement: string;
  }[];
  
  titles: {
    id: string;
    name: string;
    requirement: string;
    bonus: number;
  }[];
  
  currency: {
    perEdit: number;
    perArticle: number;
    perFeatured: number;
    perVerification: number;
  };
}

// ============================================
// GUÍAS PREDEFINIDAS
// ============================================
export const PREDEFINED_GUIDES: Partial<Guide>[] = [
  {
    id: 'guide_newbie_friendly',
    title: 'Guía para Nuevos Comandantes',
    type: 'tutorial',
    difficulty: 'beginner',
    content: {
      summary: 'Todo lo que necesitas saber para comenzar tu aventura',
      sections: [],
      tags: ['newbie', 'tutorial', 'basics'],
      language: 'es',
      lastUpdated: Date.now(),
      version: '1.0'
    },
    metadata: {
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      readTime: 15,
      wordCount: 3000,
      viewCount: 50000,
      uniqueViews: 25000
    },
    ratings: {
      average: 4.5,
      count: 1250,
      distribution: { 1: 10, 2: 20, 3: 100, 4: 400, 5: 720 },
      helpfulVotes: 2000,
      unhelpfulVotes: 50
    },
    status: {
      published: true,
      featured: true,
      verified: true,
      outdated: false,
      underReview: false,
      deprecated: false
    },
    gameVersion: '1.0'
  },
  {
    id: 'guide_fleet_composition',
    title: 'Composición Óptima de Flotas',
    type: 'strategy',
    difficulty: 'advanced',
    content: {
      summary: 'Análisis profundo de las mejores combinaciones de naves',
      sections: [],
      tags: ['fleet', 'strategy', 'pvp', 'optimization'],
      language: 'es',
      lastUpdated: Date.now(),
      version: '2.1'
    },
    metadata: {
      createdAt: Date.now() - 604800000,
      lastUpdated: Date.now(),
      readTime: 25,
      wordCount: 5000,
      viewCount: 15000,
      uniqueViews: 8000
    },
    ratings: {
      average: 4.8,
      count: 450,
      distribution: { 1: 5, 2: 5, 3: 20, 4: 100, 5: 320 },
      helpfulVotes: 800,
      unhelpfulVotes: 10
    },
    status: {
      published: true,
      featured: true,
      verified: true,
      outdated: false,
      underReview: false,
      deprecated: false
    },
    gameVersion: '1.2'
  }
];

// ============================================
// HELPERS
// ============================================
export function calculateGuideScore(guide: Guide): number {
  let score = 0;
  
  // Factor de rating
  score += guide.ratings.average * 20;
  
  // Factor de votos
  score += Math.min(50, guide.ratings.count / 10);
  
  // Factor de engagement
  score += guide.interaction.comments * 2;
  score += guide.interaction.bookmarks * 3;
  score += guide.interaction.shares * 5;
  
  // Factor de calidad de contenido
  score += Math.min(30, guide.metadata.wordCount / 100);
  
  // Factor de frescura
  const daysSinceUpdate = (Date.now() - guide.metadata.lastUpdated) / 86400000;
  score -= Math.min(20, daysSinceUpdate / 10);
  
  // Factor de autor
  if (guide.author.verified) score += 10;
  score += Math.min(20, guide.author.reputation / 100);
  
  return score;
}

export function shouldFeatureGuide(guide: Guide, criteria: VotingSystem['featured']['criteria']): boolean {
  return (
    guide.ratings.average >= criteria.minRating &&
    guide.ratings.count >= criteria.minVotes &&
    (Date.now() - guide.metadata.lastUpdated) <= criteria.maxAge * 86400000 &&
    guide.author.reputation >= criteria.authorReputation &&
    guide.status.published &&
    !guide.status.deprecated &&
    !guide.status.outdated
  );
}

export function findGuidesByTag(guides: Guide[], tag: string): Guide[] {
  return guides.filter(g => 
    g.content.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

export function findGuidesByType(guides: Guide[], type: GuideType): Guide[] {
  return guides.filter(g => g.type === type);
}

export function findGuidesByDifficulty(guides: Guide[], difficulty: GuideDifficulty): Guide[] {
  return guides.filter(g => g.difficulty === difficulty);
}

export function searchGuides(guides: Guide[], query: string): Guide[] {
  const lowerQuery = query.toLowerCase();
  return guides.filter(g => 
    g.title.toLowerCase().includes(lowerQuery) ||
    g.content.summary.toLowerCase().includes(lowerQuery) ||
    g.content.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
}

export function sortGuidesByRating(guides: Guide[]): Guide[] {
  return [...guides].sort((a, b) => b.ratings.average - a.ratings.average);
}

export function sortGuidesByRecency(guides: Guide[]): Guide[] {
  return [...guides].sort((a, b) => b.metadata.lastUpdated - a.metadata.lastUpdated);
}

export function getPopularTags(guides: Guide[]): { tag: string; count: number }[] {
  const tagCounts: Record<string, number> = {};
  guides.forEach(g => {
    g.content.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export const CommunityGuidesSystem = {
  PREDEFINED_GUIDES,
  calculateGuideScore,
  shouldFeatureGuide,
  findGuidesByTag,
  findGuidesByType,
  findGuidesByDifficulty,
  searchGuides,
  sortGuidesByRating,
  sortGuidesByRecency,
  getPopularTags
};
