/**
 * SISTEMA DE API Y WEBHOOKS - GALAXY ONLINE II
 * API REST, webhooks, integraciones, desarrolladores
 */

// ============================================
// TIPOS DE API
// ============================================
export type ApiVersion = 'v1' | 'v2' | 'v3';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// ============================================
// ENDPOINT DE API
// ============================================
export interface ApiEndpoint {
  id: string;
  path: string;
  method: HttpMethod;
  version: ApiVersion;
  
  // Información
  info: {
    name: string;
    description: string;
    category: string;
    tags: string[];
    
    // Estado
    deprecated: boolean;
    deprecatedAt?: number;
    deprecationMessage?: string;
    
    // Versión
    stable: boolean;
    beta: boolean;
    experimental: boolean;
  };
  
  // Parámetros
  parameters: {
    // Path parameters
    path: {
      name: string;
      type: 'string' | 'number' | 'boolean' | 'uuid';
      required: boolean;
      description: string;
      example?: any;
    }[];
    
    // Query parameters
    query: {
      name: string;
      type: 'string' | 'number' | 'boolean' | 'array' | 'object';
      required: boolean;
      description: string;
      example?: any;
      defaultValue?: any;
    }[];
    
    // Headers
    headers: {
      name: string;
      type: 'string';
      required: boolean;
      description: string;
      example?: string;
    }[];
  };
  
  // Request body
  requestBody?: {
    contentType: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data';
    schema: {
      type: 'object' | 'array' | 'string' | 'number' | 'boolean';
      properties: Record<string, {
        type: string;
        required?: boolean;
        description: string;
        example?: any;
      }>;
    };
    example?: any;
  };
  
  // Responses
  responses: {
    statusCode: number;
    description: string;
    contentType: string;
    
    // Schema
    schema?: {
      type: 'object' | 'array' | 'string' | 'number' | 'boolean';
      properties?: Record<string, any>;
    };
    
    // Examples
    examples?: {
      name: string;
      value: any;
    }[];
  }[];
  
  // Seguridad
  security: {
    // Autenticación requerida
    authentication: {
      type: 'none' | 'api_key' | 'bearer' | 'oauth2' | 'basic';
      required: boolean;
    };
    
    // Scopes de OAuth2
    scopes?: string[];
    
    // Rate limiting
    rateLimit: {
      requests: number;
      window: number; // segundos
      perUser: boolean;
      perKey: boolean;
    };
    
    // Permisos
    permissions: string[];
  };
  
  // Implementación
  implementation: {
    // Handler
    handler: string; // nombre de la función
    
    // Middleware
    middleware: string[];
    
    // Validación
    validation: {
      enabled: boolean;
      strict: boolean;
      customValidators: string[];
    };
    
    // Caching
    cache: {
      enabled: boolean;
      ttl: number; // segundos
      keyGenerator?: string;
    };
  };
}

// ============================================
// WEBHOOK
// ============================================
export interface Webhook {
  id: string;
  name: string;
  description: string;
  
  // Configuración
  config: {
    // URL
    url: string;
    
    // Eventos
    events: string[];
    
    // Seguridad
    secret?: string;
    
    // Configuración HTTP
    method: 'POST' | 'PUT';
    headers: Record<string, string>;
    
    // Timeout
    timeout: number; // segundos
    
    // Reintentos
    retries: {
      maxAttempts: number;
      backoff: 'linear' | 'exponential';
      delay: number;
    };
  };
  
  // Filtros
  filters: {
    // Por jugador
    playerIds?: string[];
    
    // Por tipo de evento
    eventTypes?: string[];
    
    // Por datos
    dataFilters: {
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
      value: any;
    }[];
  };
  
  // Transformación
  transformation: {
    // Mapeo de campos
    fieldMapping: Record<string, string>;
    
    // Template
    template?: string;
    
    // Script personalizado
    customScript?: string;
  };
  
  // Estado
  status: {
    active: boolean;
    created: number;
    lastTriggered?: number;
    
    // Estadísticas
    totalSent: number;
    totalFailed: number;
    successRate: number;
    
    // Últimos errores
    lastErrors: {
      timestamp: number;
      error: string;
      statusCode?: number;
    }[];
  };
}

// ============================================
// EVENTO DE WEBHOOK
// ============================================
export interface WebhookEvent {
  id: string;
  type: string;
  timestamp: number;
  
  // Datos del evento
  data: {
    // Jugador
    player?: {
      id: string;
      name: string;
      level: number;
      faction?: string;
    };
    
    // Contexto
    context: {
      system: string;
      component?: string;
      action: string;
    };
    
    // Payload específico
    payload: Record<string, any>;
  };
  
  // Metadatos
  metadata: {
    version: string;
    source: string;
    correlationId?: string;
    
    // Prioridad
    priority: 'low' | 'medium' | 'high' | 'critical';
    
    // Intentos
    attempt: number;
    maxAttempts: number;
  };
}

// ============================================
// APLICACIÓN DE DESARROLLADOR
// ============================================
export interface DeveloperApp {
  id: string;
  name: string;
  description: string;
  
  // Información del desarrollador
  developer: {
    id: string;
    name: string;
    email: string;
    organization?: string;
  };
  
  // Configuración
  config: {
    // URLs
    callbackUrls: string[];
    webhookUrl?: string;
    
    // Scopes
    scopes: string[];
    
    // Permisos
    permissions: string[];
    
    // Rate limiting
    rateLimit: {
      requests: number;
      window: number;
    };
  };
  
  // Credenciales
  credentials: {
    // API Keys
    apiKeys: {
      id: string;
      name: string;
      key: string;
      permissions: string[];
      created: number;
      lastUsed?: number;
      active: boolean;
    }[];
    
    // OAuth2
    oauth2: {
      clientId: string;
      clientSecret: string;
      redirectUris: string[];
      grantTypes: ('authorization_code' | 'client_credentials' | 'refresh_token')[];
    };
  };
  
  // Estadísticas
  statistics: {
    // Uso
    totalRequests: number;
    requestsThisMonth: number;
    requestsToday: number;
    
    // Errores
    errorRate: number;
    lastError?: number;
    
    // Top endpoints
    topEndpoints: {
      endpoint: string;
      count: number;
    }[];
  };
  
  // Estado
  status: {
    active: boolean;
    approved: boolean;
    approvedAt?: number;
    approvedBy?: string;
    
    // Suspensión
    suspended: boolean;
    suspendedAt?: number;
    suspendedReason?: string;
    
    // Límites
    limits: {
      requestsPerMonth: number;
      webhookEventsPerMonth: number;
      storageQuota: number; // MB
    };
  };
}

// ============================================
// DOCUMENTACIÓN DE API
// ============================================
export interface ApiDocumentation {
  // General
  general: {
    title: string;
    description: string;
    version: string;
    baseUrl: string;
    
    // Contacto
    contact: {
      name: string;
      email: string;
      url?: string;
    };
    
    // Licencia
    license: {
      name: string;
      url?: string;
    };
  };
  
  // Autenticación
  authentication: {
    // API Key
    apiKey: {
      description: string;
      headerName: string;
      queryParam?: string;
    };
    
    // OAuth2
    oauth2: {
      flows: {
        authorizationCode: {
          authorizationUrl: string;
          tokenUrl: string;
          scopes: Record<string, string>;
        };
        clientCredentials: {
          tokenUrl: string;
          scopes: Record<string, string>;
        };
      };
    };
    
    // Bearer Token
    bearer: {
      description: string;
      scheme: string;
    };
  };
  
  // Endpoints
  endpoints: ApiEndpoint[];
  
  // Modelos
  schemas: {
    name: string;
    type: 'object' | 'array' | 'string' | 'number' | 'boolean';
    description: string;
    properties?: Record<string, {
      type: string;
      description: string;
      required?: boolean;
      example?: any;
    }>;
    example?: any;
  }[];
  
  // Ejemplos
  examples: {
    name: string;
    description: string;
    request: {
      method: string;
      url: string;
      headers?: Record<string, string>;
      body?: any;
    };
    response: {
      statusCode: number;
      headers?: Record<string, string>;
      body?: any;
    };
  }[];
}

// ============================================
// MONITOREO DE API
// ============================================
export interface ApiMonitoring {
  // Métricas generales
  metrics: {
    // Requests
    totalRequests: number;
    requestsPerSecond: number;
    averageResponseTime: number;
    
    // Errores
    errorRate: number;
    errorsByType: Record<string, number>;
    
    // Status codes
    statusCodes: Record<number, number>;
    
    // Endpoints
    topEndpoints: {
      path: string;
      method: string;
      count: number;
      avgResponseTime: number;
    }[];
  };
  
  // Alertas
  alerts: {
    // Configuración
    thresholds: {
      errorRate: number;
      responseTime: number;
      requestsPerSecond: number;
    };
    
    // Activas
    active: {
      id: string;
      type: 'error_rate' | 'response_time' | 'rps' | 'down';
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      triggeredAt: number;
      resolvedAt?: number;
    }[];
  };
  
  // Logs
  logs: {
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    timestamp: number;
    
    // Contexto
    context: {
      endpoint?: string;
      method?: string;
      statusCode?: number;
      responseTime?: number;
      userId?: string;
      apiKey?: string;
    };
  }[];
}

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================
export interface ApiSystemConfig {
  // General
  general: {
    baseUrl: string;
    version: ApiVersion;
    
    // CORS
    cors: {
      enabled: boolean;
      origins: string[];
      methods: HttpMethod[];
      headers: string[];
    };
    
    // Rate limiting global
    globalRateLimit: {
      requests: number;
      window: number;
    };
  };
  
  // Seguridad
  security: {
    // API Keys
    apiKeys: {
      minLength: number;
      maxLength: number;
      prefix: string;
      expirationDays: number;
    };
    
    // OAuth2
    oauth2: {
      accessTokenExpiration: number; // segundos
      refreshTokenExpiration: number; // segundos
      issuer: string;
    };
    
    // Validación
    validation: {
      strictMode: boolean;
      sanitizeInput: boolean;
      validateOutput: boolean;
    };
  };
  
  // Webhooks
  webhooks: {
    // Entrega
    delivery: {
      maxRetries: number;
      timeout: number;
      batchSize: number;
    };
    
    // Eventos
    events: {
      retentionDays: number;
      maxPayloadSize: number; // bytes
    };
    
    // Seguridad
    security: {
      requireSignature: boolean;
      signatureAlgorithm: string;
      allowedIpRanges: string[];
    };
  };
  
  // Monitorización
  monitoring: {
    // Métricas
    enableMetrics: boolean;
    metricsInterval: number; // segundos
    
    // Logs
    enableLogs: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    
    // Alertas
    enableAlerts: boolean;
    alertWebhook?: string;
  };
}

// ============================================
// ENDPOINTS PREDEFINIDOS
// ============================================
export const PREDEFINED_API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'player_profile',
    path: '/api/v1/players/{playerId}',
    method: 'GET',
    version: 'v1',
    info: {
      name: 'Get Player Profile',
      description: 'Obtiene el perfil de un jugador específico',
      category: 'players',
      tags: ['profile', 'player'],
      deprecated: false,
      stable: true,
      beta: false,
      experimental: false
    },
    parameters: {
      path: [
        {
          name: 'playerId',
          type: 'string',
          required: true,
          description: 'ID del jugador',
          example: '123e4567-e89b-12d3-a456-426614174000'
        }
      ],
      query: [
        {
          name: 'include',
          type: 'array',
          required: false,
          description: 'Campos adicionales a incluir',
          example: ['stats', 'achievements', 'inventory']
        }
      ],
      headers: [
        {
          name: 'Authorization',
          type: 'string',
          required: true,
          description: 'Bearer token',
          example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      ]
    },
    responses: [
      {
        statusCode: 200,
        description: 'Perfil del jugador',
        contentType: 'application/json',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            level: { type: 'number' },
            faction: { type: 'string' }
          }
        }
      },
      {
        statusCode: 404,
        description: 'Jugador no encontrado',
        contentType: 'application/json'
      }
    ],
    security: {
      authentication: {
        type: 'bearer',
        required: true
      },
      rateLimit: {
        requests: 100,
        window: 60,
        perUser: true,
        perKey: false
      },
      permissions: ['read:profile']
    },
    implementation: {
      handler: 'getPlayerProfile',
      middleware: ['auth', 'rateLimit'],
      validation: {
        enabled: true,
        strict: true,
        customValidators: []
      },
      cache: {
        enabled: true,
        ttl: 300
      }
    }
  },
  {
    id: 'player_stats',
    path: '/api/v1/players/{playerId}/stats',
    method: 'GET',
    version: 'v1',
    info: {
      name: 'Get Player Statistics',
      description: 'Obtiene las estadísticas detalladas de un jugador',
      category: 'players',
      tags: ['stats', 'player'],
      deprecated: false,
      stable: true,
      beta: false,
      experimental: false
    },
    parameters: {
      path: [
        {
          name: 'playerId',
          type: 'string',
          required: true,
          description: 'ID del jugador'
        }
      ],
      query: [
        {
          name: 'category',
          type: 'string',
          required: false,
          description: 'Categoría de estadísticas',
          example: 'combat'
        }
      ],
      headers: [
        {
          name: 'Authorization',
          type: 'string',
          required: true,
          description: 'Bearer token'
        }
      ]
    },
    responses: [
      {
        statusCode: 200,
        description: 'Estadísticas del jugador',
        contentType: 'application/json'
      }
    ],
    security: {
      authentication: {
        type: 'bearer',
        required: true
      },
      rateLimit: {
        requests: 50,
        window: 60,
        perUser: true,
        perKey: false
      },
      permissions: ['read:stats']
    },
    implementation: {
      handler: 'getPlayerStats',
      middleware: ['auth', 'rateLimit'],
      validation: {
        enabled: true,
        strict: true,
        customValidators: []
      },
      cache: {
        enabled: true,
        ttl: 600
      }
    }
  }
];

// ============================================
// HELPERS
// ============================================
export function createApiEndpoint(
  path: string,
  method: HttpMethod,
  version: ApiVersion,
  name: string,
  description: string
): ApiEndpoint {
  return {
    id: `endpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    path,
    method,
    version,
    info: {
      name,
      description,
      category: 'general',
      tags: [],
      deprecated: false,
      stable: false,
      beta: true,
      experimental: false
    },
    parameters: {
      path: [],
      query: [],
      headers: []
    },
    responses: [],
    security: {
      authentication: {
        type: 'none',
        required: false
      },
      rateLimit: {
        requests: 100,
        window: 60,
        perUser: false,
        perKey: false
      },
      permissions: []
    },
    implementation: {
      handler: '',
      middleware: [],
      validation: {
        enabled: true,
        strict: false,
        customValidators: []
      },
      cache: {
        enabled: false,
        ttl: 300
      }
    }
  };
}

export function createWebhook(
  name: string,
  description: string,
  url: string,
  events: string[]
): Webhook {
  return {
    id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    config: {
      url,
      events,
      method: 'POST',
      headers: {},
      timeout: 30,
      retries: {
        maxAttempts: 3,
        backoff: 'exponential',
        delay: 1000
      }
    },
    filters: {
      dataFilters: []
    },
    transformation: {
      fieldMapping: {}
    },
    status: {
      active: true,
      created: Date.now(),
      totalSent: 0,
      totalFailed: 0,
      successRate: 0,
      lastErrors: []
    }
  };
}

export function createDeveloperApp(
  name: string,
  description: string,
  developerId: string
): DeveloperApp {
  return {
    id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    developer: {
      id: developerId,
      name: '',
      email: ''
    },
    config: {
      callbackUrls: [],
      scopes: [],
      permissions: [],
      rateLimit: {
        requests: 1000,
        window: 3600
      }
    },
    credentials: {
      apiKeys: [],
      oauth2: {
        clientId: '',
        clientSecret: '',
        redirectUris: [],
        grantTypes: ['authorization_code']
      }
    },
    statistics: {
      totalRequests: 0,
      requestsThisMonth: 0,
      requestsToday: 0,
      errorRate: 0,
      topEndpoints: []
    },
    status: {
      active: false,
      approved: false,
      suspended: false,
      limits: {
        requestsPerMonth: 10000,
        webhookEventsPerMonth: 1000,
        storageQuota: 100
      }
    }
  };
}

export function generateApiKey(
  appId: string,
  name: string,
  permissions: string[]
): DeveloperApp['credentials']['apiKeys'][0] {
  return {
    id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    key: `gok_${Math.random().toString(36).substr(2, 32)}`,
    permissions,
    created: Date.now(),
    active: true
  };
}

export function validateApiRequest(
  endpoint: ApiEndpoint,
  request: {
    path: Record<string, any>;
    query: Record<string, any>;
    headers: Record<string, any>;
    body?: any;
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validar path parameters
  endpoint.parameters.path.forEach(param => {
    if (param.required && !request.path[param.name]) {
      errors.push(`Path parameter '${param.name}' is required`);
    }
  });
  
  // Validar query parameters
  endpoint.parameters.query.forEach(param => {
    if (param.required && !request.query[param.name]) {
      errors.push(`Query parameter '${param.name}' is required`);
    }
  });
  
  // Validar headers
  endpoint.parameters.headers.forEach(param => {
    if (param.required && !request.headers[param.name]) {
      errors.push(`Header '${param.name}' is required`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function generateWebhookSignature(
  payload: string,
  secret: string,
  algorithm: string = 'sha256'
): string {
  // Implementación simplificada - en producción usar crypto
  return `${algorithm}=${Buffer.from(payload + secret).toString('base64')}`;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return signature === expectedSignature;
}

export const ApiSystem = {
  PREDEFINED_API_ENDPOINTS,
  createApiEndpoint,
  createWebhook,
  createDeveloperApp,
  generateApiKey,
  validateApiRequest,
  generateWebhookSignature,
  verifyWebhookSignature
};
