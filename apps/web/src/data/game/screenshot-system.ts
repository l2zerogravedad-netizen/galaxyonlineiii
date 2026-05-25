/**
 * SISTEMA DE CAPTURAS DE PANTALLA Y GALERÍA - GALAXY ONLINE II
 * Capturas de pantalla, galería, edición, compartición
 */

// ============================================
// TIPOS DE CAPTURAS
// ============================================
export type ScreenshotType = 
  | 'manual'           // Captura manual
  | 'auto'             // Captura automática
  | 'achievement'      // Logro desbloqueado
  | 'victory'          // Victoria en combate
  | 'event'            // Evento especial
  | 'scenic'           // Vista panorámica
  | 'portrait'         // Retrato de personaje
  | 'ship'             // Nave espacial
  | 'base'             // Base espacial
  | 'fleet'            // Flota completa
  | 'battle'           // Momento de batalla
  | 'ceremony'         // Ceremonia o evento
  | 'custom';          // Personalizado

export type ScreenshotFormat = 'png' | 'jpg' | 'webp' | 'gif' | 'bmp';

// ============================================
// CAPTURA DE PANTALLA
// ============================================
export interface Screenshot {
  id: string;
  playerId: string;
  
  // Información básica
  info: {
    type: ScreenshotType;
    title?: string;
    description?: string;
    tags: string[];
    
    // Timestamp
    capturedAt: number;
    location?: {
      system: string;
      planet?: string;
      coordinates: { x: number; y: number; z: number };
    };
    
    // Contexto
    context: {
      activity: string;
      participants?: string[];
      event?: string;
      mission?: string;
    };
  };
  
  // Archivo
  file: {
    filename: string;
    format: ScreenshotFormat;
    size: number; // bytes
    width: number;
    height: number;
    
    // URLs
    originalUrl: string;
    thumbnailUrl: string;
    mediumUrl?: string;
    
    // Calidad
    quality: number; // 0-100
    compression: number; // 0-100
  };
  
  // Configuración de captura
  capture: {
    // Configuración de cámara
    camera: {
      position: { x: number; y: number; z: number };
      rotation: { x: number; y: number; z: number };
      fov: number;
      
      // Tipo de vista
      viewMode: 'first_person' | 'third_person' | 'cinematic' | 'free' | 'orbit';
      
      // Efectos
      effects: {
        dof: boolean;
        bloom: boolean;
        motionBlur: boolean;
        antiAliasing: boolean;
      };
    };
    
    // UI
    ui: {
      showInterface: boolean;
      showChat: boolean;
      showNames: boolean;
      showHealthBars: boolean;
      showMinimap: boolean;
      
      // Transparencia
      interfaceOpacity: number; // 0-1
    };
    
    // Filtros
    filters: {
      brightness: number; // -100 a 100
      contrast: number;   // -100 a 100
      saturation: number; // -100 a 100
      hue: number;        // -180 a 180
      blur: number;       // 0 a 100
      vignette: number;   // 0 a 100
      
      // Presets
      preset?: string;
    };
    
    // Recorte
    crop?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  
  // Metadatos técnicos
  metadata: {
    // Motor gráfico
    engine: {
      version: string;
      renderer: string;
      settings: {
        resolution: string;
        quality: string;
        fps: number;
      };
    };
    
    // Sistema
    system: {
      platform: string;
      gpu: string;
      ram: string;
    };
    
    // Juego
    game: {
      version: string;
      build: string;
      mods: string[];
    };
  };
  
  // Edición
  editing: {
    edited: boolean;
    editedAt?: number;
    
    // Herramientas usadas
    tools: {
      crop: boolean;
      filters: boolean;
      text: boolean;
      drawing: boolean;
      stickers: boolean;
    }[];
    
    // Capas
    layers: {
      id: string;
      type: 'image' | 'text' | 'drawing' | 'sticker' | 'filter';
      visible: boolean;
      opacity: number;
      blendMode: string;
    }[];
  };
  
  // Social
  social: {
    // Visibilidad
    visibility: 'private' | 'friends' | 'public' | 'unlisted';
    
    // Estadísticas
    views: number;
    likes: number;
    comments: number;
    shares: number;
    downloads: number;
    
    // Destacados
    featured: boolean;
    featuredBy?: string;
    featuredAt?: number;
    
    // Reportes
    reports: number;
    reportedBy: string[];
  };
  
  // Álbumes
  albums: {
    id: string;
    name: string;
    addedAt: number;
  }[];
}

// ============================================
// ÁLBUM DE CAPTURAS
// ============================================
export interface ScreenshotAlbum {
  id: string;
  playerId: string;
  
  // Información
  info: {
    name: string;
    description?: string;
    coverImage?: string;
    
    // Configuración
    visibility: 'private' | 'friends' | 'public';
    allowComments: boolean;
    allowDownloads: boolean;
    
    // Organización
    sortBy: 'date' | 'name' | 'likes' | 'views';
    sortOrder: 'asc' | 'desc';
  };
  
  // Contenido
  content: {
    screenshots: string[]; // IDs
    count: number;
    
    // Estadísticas
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    
    // Categorías
    categories: {
      name: string;
      screenshotIds: string[];
    }[];
  };
  
  // Compartición
  sharing: {
    shareCode: string;
    shareUrl: string;
    embedCode?: string;
    
    // Permisos
    allowEmbed: boolean;
    allowDirectLink: boolean;
    passwordProtected: boolean;
    password?: string;
  };
  
  // Metadatos
  metadata: {
    created: number;
    lastModified: number;
    lastViewed?: number;
    
    // Colaboración
    collaborators: {
      playerId: string;
      role: 'viewer' | 'editor' | 'admin';
      addedAt: number;
    }[];
  };
}

// ============================================
// EDITOR DE IMÁGENES
// ============================================
export interface ImageEditor {
  // Herramientas
  tools: {
    // Recorte
    crop: {
      enabled: boolean;
      aspectRatio?: string;
      freeform: boolean;
      
      // Presets
      presets: {
        name: string;
        ratio: string;
      }[];
    };
    
    // Filtros
    filters: {
      brightness: {
        enabled: boolean;
        value: number;
        min: number;
        max: number;
      };
      contrast: {
        enabled: boolean;
        value: number;
        min: number;
        max: number;
      };
      saturation: {
        enabled: boolean;
        value: number;
        min: number;
        max: number;
      };
      hue: {
        enabled: boolean;
        value: number;
        min: number;
        max: number;
      };
      
      // Presets
      presets: {
        name: string;
        settings: Record<string, number>;
      }[];
    };
    
    // Texto
    text: {
      enabled: boolean;
      
      // Opciones de texto
      options: {
        font: string;
        size: number;
        color: string;
        bold: boolean;
        italic: boolean;
        underline: boolean;
        align: 'left' | 'center' | 'right';
        
        // Efectos
        shadow: boolean;
        stroke: boolean;
        gradient: boolean;
      };
      
      // Capas de texto
      layers: {
        id: string;
        text: string;
        position: { x: number; y: number };
        options: ImageEditor['tools']['text']['options'];
      }[];
    };
    
    // Dibujo
    drawing: {
      enabled: boolean;
      
      // Herramientas de dibujo
      tools: {
        brush: {
          size: number;
          hardness: number;
          opacity: number;
          color: string;
        };
        eraser: {
          size: number;
          hardness: number;
        };
        shape: {
          type: 'rectangle' | 'circle' | 'line' | 'arrow';
          fill: boolean;
          stroke: boolean;
          strokeWidth: number;
        };
      };
      
      // Capas de dibujo
      layers: {
        id: string;
        strokes: {
          points: { x: number; y: number }[];
          tool: string;
          settings: Record<string, any>;
        }[];
      }[];
    };
    
    // Stickers
    stickers: {
      enabled: boolean;
      
      // Categorías
      categories: {
        id: string;
        name: string;
        stickers: {
          id: string;
          name: string;
          imageUrl: string;
          animated: boolean;
        }[];
      }[];
      
      // Stickers colocados
      placed: {
        id: string;
        stickerId: string;
        position: { x: number; y: number };
        scale: number;
        rotation: number;
      }[];
    };
  };
  
  // Historial
  history: {
    actions: {
      type: string;
      timestamp: number;
      data: any;
    }[];
    
    // Deshacer/Rehacer
    currentIndex: number;
    maxHistory: number;
  };
}

// ============================================
// SISTEMA DE CAPTURA AUTOMÁTICA
// ============================================
export interface AutoCapture {
  // Configuración
  config: {
    enabled: boolean;
    
    // Eventos que activan captura
    triggers: {
      achievement: boolean;
      victory: boolean;
      defeat: boolean;
      levelUp: boolean;
      rareFind: boolean;
      specialMoment: boolean;
      
      // Personalizados
      customTriggers: {
        name: string;
        condition: string;
      }[];
    };
    
    // Configuración de captura
    settings: {
      quality: number;
      format: ScreenshotFormat;
      includeUI: boolean;
      delay: number; // segundos después del evento
      
      // Límites
      maxPerSession: number;
      maxPerDay: number;
      storageLimit: number; // MB
    };
    
    // Filtros automáticos
    autoFilters: {
      enabled: boolean;
      preset: string;
      intensity: number;
    };
  };
  
  // Estadísticas
  stats: {
    totalCaptured: number;
    todayCaptured: number;
    thisSession: number;
    
    // Por tipo
    byType: Record<ScreenshotType, number>;
    
    // Espacio usado
    storageUsed: number;
    storageLimit: number;
  };
}

// ============================================
// GALERÍA COMUNITARIA
// ============================================
export interface CommunityGallery {
  // Exploración
  browse: {
    // Filtros
    filters: {
      type?: ScreenshotType;
      dateRange?: {
        start: number;
        end: number;
      };
      playerLevel?: {
        min: number;
        max: number;
      };
      tags?: string[];
      featured?: boolean;
    };
    
    // Ordenamiento
    sortBy: 'recent' | 'popular' | 'trending' | 'random' | 'curated';
    sortOrder: 'asc' | 'desc';
    
    // Resultados
    results: Screenshot[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
  
  // Curación
  curation: {
    // Imágenes destacadas
    featured: {
      daily: Screenshot[];
      weekly: Screenshot[];
      monthly: Screenshot[];
      allTime: Screenshot[];
    };
    
    // Temas
    themes: {
      id: string;
      name: string;
      description: string;
      banner: string;
      screenshots: string[];
      startDate: number;
      endDate: number;
    }[];
    
    // Curadores
    curators: {
      playerId: string;
      playerName: string;
      role: string;
      featuredCount: number;
    }[];
  };
  
  // Concursos
  contests: {
    id: string;
    name: string;
    description: string;
    
    // Tema
    theme: string;
    rules: string[];
    
    // Fechas
    startDate: number;
    endDate: number;
    votingStart: number;
    votingEnd: number;
    
    // Premios
    prizes: {
      rank: number;
      rewards: string[];
    }[];
    
    // Participación
    submissions: string[]; // Screenshot IDs
    votes: {
      screenshotId: string;
      voterId: string;
      rating: number; // 1-5
    }[];
    
    // Resultados
    winners?: {
      rank: number;
      screenshotId: string;
      playerId: string;
    }[];
  }[];
}

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================
export interface ScreenshotSystemConfig {
  // Captura
  capture: {
    defaultFormat: ScreenshotFormat;
    defaultQuality: number;
    maxResolution: {
      width: number;
      height: number;
    };
    
    // Atajos de teclado
    hotkeys: {
      screenshot: string;
      screenshotNoUI: string;
      screenshotRegion: string;
      openGallery: string;
    };
  };
  
  // Almacenamiento
  storage: {
    maxScreenshotsPerPlayer: number;
    maxFileSize: number; // MB
    maxStoragePerPlayer: number; // MB
    
    // Auto-limpieza
    autoCleanup: boolean;
    cleanupAfterDays: number;
  };
  
  // Social
  social: {
    defaultVisibility: 'private' | 'friends' | 'public';
    allowPublicSharing: boolean;
    allowComments: boolean;
    allowDownloads: boolean;
    
    // Moderación
    requireApprovalForPublic: boolean;
    autoModeration: boolean;
  };
  
  // Galería
  gallery: {
    itemsPerPage: number;
    maxAlbums: number;
    maxScreenshotsPerAlbum: number;
    
    // Búsqueda
    searchEnabled: boolean;
    tagLimit: number;
  };
}

// ============================================
// HELPERS
// ============================================
export function createScreenshot(
  playerId: string,
  type: ScreenshotType,
  fileUrl: string,
  thumbnailUrl: string,
  width: number,
  height: number
): Screenshot {
  return {
    id: `screenshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    playerId,
    info: {
      type,
      tags: [],
      capturedAt: Date.now(),
      context: {
        activity: 'unknown'
      }
    },
    file: {
      filename: `screenshot_${Date.now()}.png`,
      format: 'png',
      size: 0,
      width,
      height,
      originalUrl: fileUrl,
      thumbnailUrl,
      quality: 90,
      compression: 80
    },
    capture: {
      camera: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        fov: 75,
        viewMode: 'third_person',
        effects: {
          dof: false,
          bloom: false,
          motionBlur: false,
          antiAliasing: true
        }
      },
      ui: {
        showInterface: true,
        showChat: true,
        showNames: true,
        showHealthBars: true,
        showMinimap: true,
        interfaceOpacity: 1.0
      },
      filters: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        hue: 0,
        blur: 0,
        vignette: 0
      }
    },
    metadata: {
      engine: {
        version: '1.0.0',
        renderer: 'DirectX 12',
        settings: {
          resolution: '1920x1080',
          quality: 'Ultra',
          fps: 60
        }
      },
      system: {
        platform: 'Windows',
        gpu: 'RTX 3080',
        ram: '16GB'
      },
      game: {
        version: '2.5.0',
        build: '12345',
        mods: []
      }
    },
    editing: {
      edited: false,
      tools: [],
      layers: []
    },
    social: {
      visibility: 'private',
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      downloads: 0,
      featured: false,
      reports: 0,
      reportedBy: []
    },
    albums: []
  };
}

export function createAlbum(
  playerId: string,
  name: string,
  description?: string
): ScreenshotAlbum {
  return {
    id: `album_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    playerId,
    info: {
      name,
      description,
      visibility: 'private',
      allowComments: true,
      allowDownloads: true,
      sortBy: 'date',
      sortOrder: 'desc'
    },
    content: {
      screenshots: [],
      count: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      categories: []
    },
    sharing: {
      shareCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
      shareUrl: '',
      allowEmbed: false,
      allowDirectLink: true,
      passwordProtected: false
    },
    metadata: {
      created: Date.now(),
      lastModified: Date.now(),
      collaborators: []
    }
  };
}

export function addScreenshotToAlbum(
  album: ScreenshotAlbum,
  screenshotId: string
): ScreenshotAlbum {
  return {
    ...album,
    content: {
      ...album.content,
      screenshots: [...album.content.screenshots, screenshotId],
      count: album.content.count + 1
    },
    metadata: {
      ...album.metadata,
      lastModified: Date.now()
    }
  };
}

export function searchScreenshots(
  screenshots: Screenshot[],
  query: string,
  type?: ScreenshotType,
  tags?: string[]
): Screenshot[] {
  const normalizedQuery = query.toLowerCase();
  
  return screenshots.filter(screenshot => {
    // Filtrar por tipo
    if (type && screenshot.info.type !== type) {
      return false;
    }
    
    // Filtrar por tags
    if (tags && tags.length > 0) {
      const hasAllTags = tags.every(tag => 
        screenshot.info.tags.includes(tag)
      );
      if (!hasAllTags) return false;
    }
    
    // Buscar en título, descripción y tags
    const titleMatch = screenshot.info.title?.toLowerCase().includes(normalizedQuery);
    const descMatch = screenshot.info.description?.toLowerCase().includes(normalizedQuery);
    const tagMatch = screenshot.info.tags.some(tag => 
      tag.toLowerCase().includes(normalizedQuery)
    );
    
    return titleMatch || descMatch || tagMatch;
  });
}

export function getScreenshotsByType(
  screenshots: Screenshot[],
  type: ScreenshotType
): Screenshot[] {
  return screenshots.filter(screenshot => screenshot.info.type === type);
}

export function getPopularScreenshots(
  screenshots: Screenshot[],
  limit: number = 20
): Screenshot[] {
  return screenshots
    .sort((a, b) => {
      // Calcular puntuación de popularidad
      const scoreA = a.social.likes + a.social.views * 0.1 + a.social.comments * 0.5;
      const scoreB = b.social.likes + b.social.views * 0.1 + b.social.comments * 0.5;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

export function getRecentScreenshots(
  screenshots: Screenshot[],
  days: number = 7
): Screenshot[] {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  return screenshots
    .filter(screenshot => screenshot.info.capturedAt > cutoff)
    .sort((a, b) => b.info.capturedAt - a.info.capturedAt);
}

export function calculateStorageUsage(screenshots: Screenshot[]): number {
  return screenshots.reduce((total, screenshot) => 
    total + (screenshot.file.size / (1024 * 1024)), // Convertir a MB
    0
  );
}

export const ScreenshotSystem = {
  createScreenshot,
  createAlbum,
  addScreenshotToAlbum,
  searchScreenshots,
  getScreenshotsByType,
  getPopularScreenshots,
  getRecentScreenshots,
  calculateStorageUsage
};
