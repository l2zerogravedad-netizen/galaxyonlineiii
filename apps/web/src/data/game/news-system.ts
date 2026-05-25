/**
 * SISTEMA DE NOTICIAS Y COMUNICACIONES - GALAXY ONLINE II
 * Parches, anuncios, comunicados oficiales
 */

// ============================================
// TIPOS DE NOTICIAS
// ============================================
export type NewsType = 
  | 'patch_notes'       // Notas de parche
  | 'announcement'      // Anuncio general
  | 'maintenance'       // Mantenimiento programado
  | 'event'             // Evento especial
  | 'update'            // Actualización del juego
  | 'hotfix'            // Hotfix urgente
  | 'feature'           // Nueva característica
  | 'balance'           // Cambios de balance
  | 'bugfix'            // Corrección de bugs
  | 'security'          // Alerta de seguridad
  | 'community'         // Noticia comunitaria
  | 'esports'           // Noticias de esports
  | 'developer'         // Post de desarrollador
  | 'roadmap'           // Hoja de ruta
  | 'survey';           // Encuesta

export type NewsPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

// ============================================
// NOTICIA
// ============================================
export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  
  // Contenido
  content: {
    summary: string; // Resumen breve
    body: string;    // Contenido completo (HTML/Markdown)
    excerpt?: string; // Extracto para previews
  };
  
  // Metadatos
  metadata: {
    type: NewsType;
    priority: NewsPriority;
    category: string;
    tags: string[];
    
    // Autor y publicación
    author: {
      name: string;
      role: string;
      avatar?: string;
      team: string;
    };
    
    publishedAt: number;
    updatedAt?: number;
    scheduledFor?: number;
    
    // Versiones
    gameVersion?: string;
    affectedVersions?: string[];
    
    // Idiomas
    languages: string[];
    defaultLanguage: string;
  };
  
  // Multimedia
  media: {
    thumbnail?: string;
    banner?: string;
    images: string[];
    videos: {
      url: string;
      thumbnail: string;
      duration: number;
      type: 'youtube' | 'vimeo' | 'direct';
    }[];
    attachments: {
      name: string;
      url: string;
      type: string;
      size: number;
    }[];
  };
  
  // Interacción
  engagement: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    bookmarks: number;
    
    // Reacciones
    reactions: {
      emoji: string;
      count: number;
    }[];
  };
  
  // Estado
  status: {
    published: boolean;
    featured: boolean;
    pinned: boolean;
    archived: boolean;
    deleted: boolean;
    
    // Moderación
    approved: boolean;
    approvedBy?: string;
    approvedAt?: number;
    
    // Restricciones
    minLevel?: number;
    requiredFaction?: string;
    geoRestrictions?: string[];
  };
  
  // Relacionados
  related: {
    articles: string[]; // IDs de artículos relacionados
    patches: string[];  // IDs de parches relacionados
    events: string[];   // IDs de eventos relacionados
  };
}

// ============================================
// SISTEMA DE NOTAS DE PARCHE
// ============================================
export interface PatchNotes {
  id: string;
  version: string;
  buildNumber: string;
  
  // Información
  info: {
    title: string;
    description: string;
    releaseDate: number;
    deploymentTime: number;
    estimatedDowntime: number;
    
    // Servidores afectados
    servers: {
      region: string;
      status: 'completed' | 'in_progress' | 'scheduled' | 'failed';
      completedAt?: number;
    }[];
  };
  
  // Cambios
  changes: {
    new: {
      category: string;
      items: {
        title: string;
        description: string;
        impact: 'minor' | 'moderate' | 'major';
        relatedSystems?: string[];
      }[];
    }[];
    
    improved: {
      category: string;
      items: {
        title: string;
        description: string;
        before?: string;
        after?: string;
        impact: 'minor' | 'moderate' | 'major';
      }[];
    }[];
    
    balance: {
      category: string;
      items: {
        title: string;
        description: string;
        oldValue?: string;
        newValue?: string;
        reasoning: string;
      }[];
    }[];
    
    bugfixes: {
      category: string;
      items: {
        title: string;
        description: string;
        bugId?: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
      }[];
    }[];
    
    knownIssues: {
      title: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      workaround?: string;
      estimatedFix?: string;
    }[];
  };
  
  // Estadísticas
  stats: {
    totalChanges: number;
    newFeatures: number;
    improvements: number;
    balanceChanges: number;
    bugfixes: number;
    knownIssues: number;
  };
}

// ============================================
// SISTEMA DE ANUNCIOS
// ============================================
export interface Announcement {
  id: string;
  type: 'maintenance' | 'emergency' | 'event' | 'promotion' | 'warning';
  
  // Contenido
  content: {
    title: string;
    message: string;
    details?: string;
    
    // Traducciones
    translations: Partial<Record<string, {
      title: string;
      message: string;
      details?: string;
    }>>;
  };
  
  // Programación
  scheduling: {
    startAt: number;
    endAt?: number;
    recurring?: {
      type: 'daily' | 'weekly' | 'monthly';
      days?: number[];
      time?: string;
    };
    
    // Zonas horarias
    timezones: string[];
  };
  
  // Audiencia
  audience: {
    allPlayers: boolean;
    minLevel?: number;
    maxLevel?: number;
    factions?: string[];
    servers?: string[];
    platforms?: string[];
    languages?: string[];
  };
  
  // Visualización
  display: {
    locations: ('login' | 'in_game' | 'website' | 'discord' | 'mobile')[];
    priority: number;
    dismissible: boolean;
    autoHide: boolean;
    soundAlert?: boolean;
    
    // Estilo
    style: {
      type: 'banner' | 'modal' | 'toast' | 'popup' | 'notification';
      severity: 'info' | 'warning' | 'error' | 'success';
      color?: string;
      icon?: string;
    };
  };
  
  // Acciones
  actions: {
    label: string;
    url?: string;
    action?: 'dismiss' | 'accept' | 'decline' | 'learn_more';
    data?: Record<string, any>;
  }[];
  
  // Estado
  status: {
    active: boolean;
    scheduled: boolean;
    completed: boolean;
    cancelled: boolean;
    
    created: number;
    createdBy: string;
    updated?: number;
    updatedBy?: string;
  };
}

// ============================================
// SISTEMA DE COMUNICADOS OFICIALES
// ============================================
export interface OfficialCommunication {
  id: string;
  category: 'dev_blog' | 'state_of_game' | 'future_plans' | 'community_highlights' | 'transparency';
  
  // Contenido
  content: {
    title: string;
    subtitle?: string;
    body: string;
    
    // Secciones
    sections: {
      title: string;
      content: string;
      type: 'text' | 'image' | 'video' | 'chart' | 'quote';
      media?: string[];
    }[];
  };
  
  // Metadatos
  metadata: {
    author: {
      name: string;
      role: string;
      signature?: string;
      photo?: string;
    };
    
    publishedAt: number;
    readingTime: number; // minutos estimados
    
    // SEO
    seo: {
      description: string;
      keywords: string[];
      ogImage?: string;
    };
  };
  
  // Engagement
  engagement: {
    views: number;
    readTime: number; // tiempo promedio de lectura
    completionRate: number; // % que lee todo
    shares: {
      twitter: number;
      facebook: number;
      reddit: number;
      discord: number;
    };
  };
  
  // Comentarios
  comments: {
    enabled: boolean;
    moderated: boolean;
    count: number;
    topComments: {
      id: string;
      author: string;
      content: string;
      likes: number;
      timestamp: number;
    }[];
  };
}

// ============================================
// SISTEMA DE NOTIFICACIONES PUSH
// ============================================
export interface PushNotification {
  id: string;
  
  // Contenido
  content: {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    badge?: string;
    
    // Acción al tocar
    action?: {
      type: 'open_url' | 'open_app' | 'deep_link';
      target: string;
      data?: Record<string, any>;
    };
    
    // Botones
    buttons?: {
      id: string;
      title: string;
      action?: string;
    }[];
  };
  
  // Destinatarios
  recipients: {
    type: 'all' | 'segment' | 'individual';
    criteria?: {
      platforms?: string[];
      minVersion?: string;
      lastActive?: number; // días
      preferences?: string[];
    };
    playerIds?: string[];
  };
  
  // Programación
  scheduling: {
    sendAt: number;
    expireAt?: number;
    timezone: string;
    
    // Prioridad
    priority: 'normal' | 'high' | 'critical';
    
    // Tasa límite
    rateLimit?: {
      perPlayer: number; // notificaciones por hora
      perSegment: number; // notificaciones totales por hora
    };
  };
  
  // Estado
  status: {
    created: number;
    sent?: number;
    completed?: number;
    failed?: number;
    
    delivered: number;
    opened: number;
    clicked: number;
    
    // Errores
    errors: {
      count: number;
      reasons: Record<string, number>;
    };
  };
}

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================
export interface NewsSystemConfig {
  // General
  general: {
    defaultLanguage: string;
    supportedLanguages: string[];
    autoTranslate: boolean;
    
    // Moderación
    requireApproval: boolean;
    autoPublishScheduled: boolean;
  };
  
  // Contenido
  content: {
    maxArticleLength: number;
    allowedHtmlTags: string[];
    imageMaxSize: number; // MB
    videoMaxDuration: number; // segundos
    
    // SEO
    autoGenerateSlugs: boolean;
    autoGenerateExcerpts: boolean;
  };
  
  // Notificaciones
  notifications: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    inAppEnabled: boolean;
    
    // Frecuencia
    maxPerDay: number;
    quietHours: {
      start: string; // HH:MM
      end: string;   // HH:MM
      timezone: string;
    };
  };
  
  // Caché
  cache: {
    ttl: number; // segundos
    enableCdn: boolean;
    purgeOnUpdate: boolean;
  };
}

// ============================================
// ARTÍCULOS DE EJEMPLO
// ============================================
export const SAMPLE_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news_patch_2_5_0',
    title: 'Parche 2.5.0: La Era de la Exploración',
    slug: 'patch-2-5-0-era-de-la-exploracion',
    content: {
      summary: 'Nuevo parche con sistemas de exploración mejorados, naves exploradoras y eventos de descubrimiento.',
      body: `<h1>¡Bienvenidos a la Era de la Exploración!</h1>
             <p>Estamos emocionados de lanzar el parche 2.5.0...</p>`
    },
    metadata: {
      type: 'patch_notes',
      priority: 'high',
      category: 'actualizaciones',
      tags: ['parche', 'exploracion', 'naves', 'eventos'],
      author: {
        name: 'Equipo de Desarrollo',
        role: 'Lead Designer',
        team: 'Galaxy Online II'
      },
      publishedAt: Date.now(),
      gameVersion: '2.5.0',
      languages: ['es', 'en', 'de', 'fr'],
      defaultLanguage: 'es'
    },
    media: {
      thumbnail: '/images/news/patch-2-5-0-thumb.jpg',
      banner: '/images/news/patch-2-5-0-banner.jpg',
      images: ['/images/news/patch-2-5-0-1.jpg'],
      videos: [],
      attachments: []
    },
    engagement: {
      views: 15420,
      likes: 892,
      comments: 156,
      shares: 234,
      bookmarks: 445,
      reactions: [
        { emoji: '🚀', count: 456 },
        { emoji: '⭐', count: 234 },
        { emoji: '🎉', count: 202 }
      ]
    },
    status: {
      published: true,
      featured: true,
      pinned: true,
      archived: false,
      deleted: false,
      approved: true,
      approvedBy: 'admin',
      approvedAt: Date.now()
    },
    related: {
      articles: ['news_exploration_events'],
      patches: ['patch_2_5_0'],
      events: ['event_discovery_week']
    }
  }
];

// ============================================
// HELPERS
// ============================================
export function createNewsArticle(
  title: string,
  content: NewsArticle['content'],
  type: NewsType,
  author: NewsArticle['metadata']['author']
): NewsArticle {
  const now = Date.now();
  
  return {
    id: `news_${now}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    slug: title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, ''),
    content,
    metadata: {
      type,
      priority: 'medium',
      category: 'general',
      tags: [],
      author,
      publishedAt: now,
      languages: ['es'],
      defaultLanguage: 'es'
    },
    media: {
      images: [],
      videos: [],
      attachments: []
    },
    engagement: {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      bookmarks: 0,
      reactions: []
    },
    status: {
      published: false,
      featured: false,
      pinned: false,
      archived: false,
      deleted: false,
      approved: false
    },
    related: {
      articles: [],
      patches: [],
      events: []
    }
  };
}

export function formatReadingTime(content: string): number {
  // Promedio de 200 palabras por minuto
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function getArticlesByType(
  articles: NewsArticle[],
  type: NewsType
): NewsArticle[] {
  return articles.filter(article => article.metadata.type === type);
}

export function getFeaturedArticles(
  articles: NewsArticle[],
  limit: number = 5
): NewsArticle[] {
  return articles
    .filter(article => article.status.featured && article.status.published)
    .sort((a, b) => b.metadata.publishedAt - a.metadata.publishedAt)
    .slice(0, limit);
}

export function getRelatedArticles(
  article: NewsArticle,
  allArticles: NewsArticle[],
  limit: number = 3
): NewsArticle[] {
  const tags = article.metadata.tags;
  const category = article.metadata.category;
  
  return allArticles
    .filter(a => 
      a.id !== article.id &&
      a.status.published &&
      (a.metadata.category === category ||
       a.metadata.tags.some(tag => tags.includes(tag)))
    )
    .sort((a, b) => {
      // Priorizar mismos tags
      const aTags = a.metadata.tags.filter(tag => tags.includes(tag)).length;
      const bTags = b.metadata.tags.filter(tag => tags.includes(tag)).length;
      
      if (aTags !== bTags) {
        return bTags - aTags;
      }
      
      return b.metadata.publishedAt - a.metadata.publishedAt;
    })
    .slice(0, limit);
}

export function scheduleAnnouncement(
  type: Announcement['type'],
  title: string,
  message: string,
  startAt: number,
  audience: Announcement['audience']
): Announcement {
  return {
    id: `announce_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    content: {
      title,
      message,
      translations: {}
    },
    scheduling: {
      startAt,
      timezones: ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo']
    },
    audience,
    display: {
      locations: ['login', 'in_game'],
      priority: 1,
      dismissible: true,
      autoHide: false,
      style: {
        type: 'banner',
        severity: 'info'
      }
    },
    actions: [{
      label: 'Entendido',
      action: 'dismiss'
    }],
    status: {
      active: false,
      scheduled: true,
      completed: false,
      cancelled: false,
      created: Date.now(),
      createdBy: 'system'
    }
  };
}

export const NewsSystem = {
  SAMPLE_NEWS_ARTICLES,
  createNewsArticle,
  formatReadingTime,
  getArticlesByType,
  getFeaturedArticles,
  getRelatedArticles,
  scheduleAnnouncement
};
