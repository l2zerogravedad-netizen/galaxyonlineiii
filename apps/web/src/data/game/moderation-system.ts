/**
 * SISTEMA DE MODERACIÓN - GALAXY ONLINE II
 * Chat moderación, reportes, tickets
 */

// ============================================
// TIPOS DE CONTENIDO A MODERAR
// ============================================
export type ModerationContentType = 
  | 'chat_message'     // Mensaje de chat
  | 'player_name'      // Nombre de jugador
  | 'corp_name'        // Nombre de corporación
  | 'alliance_name'    // Nombre de alianza
  | 'ship_name'        // Nombre de nave
  | 'custom_message'   // Mensaje personalizado
  | 'profile_bio'      // Biografía de perfil
  | 'forum_post'       // Post en foro
  | 'comment'          // Comentario
  | 'voice_chat';      // Chat de voz

export type ModerationSeverity = 'low' | 'medium' | 'high' | 'severe';

// ============================================
// REGLA DE MODERACIÓN
// ============================================
export interface ModerationRule {
  id: string;
  name: string;
  description: string;
  
  // Tipo de contenido
  appliesTo: ModerationContentType[];
  
  // Detección
  detection: {
    type: 'keyword' | 'regex' | 'ml' | 'semantic' | 'image';
    pattern: string;
    caseSensitive: boolean;
    language: string[];
  };
  
  // Acción
  action: {
    type: 'allow' | 'block' | 'mask' | 'warn' | 'mute' | 'kick' | 'ban';
    duration?: number; // segundos
    message?: string;
  };
  
  // Severidad
  severity: ModerationSeverity;
  
  // Configuración
  config: {
    enabled: boolean;
    autoAction: boolean;
    requireReview: boolean;
    trustedUserBypass: boolean;
    contextAware: boolean;
  };
}

// ============================================
// CONTENIDO MODERADO
// ============================================
export interface ModeratedContent {
  id: string;
  timestamp: number;
  
  // Contenido
  content: {
    type: ModerationContentType;
    raw: string;
    processed?: string;
    context?: string;
  };
  
  // Autor
  author: {
    playerId: string;
    playerName: string;
    reputation: number;
    previousViolations: number;
    trustLevel: number;
  };
  
  // Resultado
  result: {
    actionTaken: ModerationRule['action']['type'];
    ruleTriggered: string[];
    severity: ModerationSeverity;
    confidence: number;
    
    // Si fue bloqueado
    blocked: boolean;
    maskedContent?: string;
    
    // Si fue permitido
    allowed: boolean;
    bypassReason?: string;
  };
  
  // Revisión
  review: {
    autoModerated: boolean;
    reviewedBy?: string;
    reviewedAt?: number;
    appealSubmitted?: boolean;
    finalDecision?: 'upheld' | 'overturned' | 'modified';
  };
}

// ============================================
// SISTEMA DE FILTRO DE CHAT
// ============================================
export interface ChatFilter {
  // Configuración
  config: {
    enabled: boolean;
    strictness: 'lenient' | 'normal' | 'strict' | 'aggressive';
    languages: string[];
    scanPrivateMessages: boolean;
    scanPublicChannels: boolean;
    scanCorpChat: boolean;
    scanAllianceChat: boolean;
  };
  
  // Listas
  lists: {
    blacklist: string[];
    whitelist: string[];
    graylist: string[];
    customRules: ModerationRule[];
  };
  
  // Respuestas
  responses: {
    warningMessage: string;
    blockMessage: string;
    muteMessage: string;
    appealInstructions: string;
  };
  
  // Evasión
  evasionDetection: {
    enabled: boolean;
    detectLeetSpeak: boolean;
    detectObfuscation: boolean;
    detectSpacing: boolean;
    detectHomoglyphs: boolean;
  };
}

// ============================================
// TICKET DE SOPORTE
// ============================================
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  
  // Solicitante
  requester: {
    playerId: string;
    playerName: string;
    email: string;
    accountAge: number;
  };
  
  // Categoría
  category: 'bug' | 'account' | 'billing' | 'harassment' | 'cheating' | 'technical' | 'feedback' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Contenido
  subject: string;
  description: string;
  
  // Evidencia
  attachments: {
    screenshots: string[];
    videos: string[];
    logs: string[];
    other: string[];
  };
  
  // Estado
  status: {
    state: 'open' | 'in_progress' | 'waiting_reply' | 'resolved' | 'closed' | 'escalated';
    createdAt: number;
    updatedAt: number;
    resolvedAt?: number;
    slaDeadline?: number;
  };
  
  // Asignación
  assignment: {
    assignedTo?: string;
    team?: string;
    escalatedTo?: string;
    escalationReason?: string;
  };
  
  // Conversación
  conversation: {
    id: string;
    author: 'user' | 'agent' | 'system';
    name: string;
    message: string;
    timestamp: number;
    internal: boolean;
    attachments: string[];
  }[];
  
  // Resolución
  resolution?: {
    solution: string;
    actions: string[];
    satisfaction?: number; // 1-5
    followUp?: string;
  };
}

// ============================================
// EQUIPO DE MODERACIÓN
// ============================================
export interface ModerationTeam {
  // Moderador
  moderator: {
    id: string;
    name: string;
    role: 'trainee' | 'moderator' | 'senior_moderator' | 'admin';
    languages: string[];
    specialties: string[];
  };
  
  // Estadísticas
  stats: {
    ticketsHandled: number;
    averageResolutionTime: number;
    satisfactionRating: number;
    accuracyRate: number;
    actionsTaken: Record<string, number>;
  };
  
  // Disponibilidad
  availability: {
    timezone: string;
    schedule: { day: string; hours: string }[];
    currentStatus: 'online' | 'away' | 'busy' | 'offline';
    maxTicketsPerDay: number;
  };
}

// ============================================
// SISTEMA DE MUTE
// ============================================
export interface MuteSystem {
  // Jugador muteado
  playerId: string;
  
  // Alcance
  scope: {
    global: boolean;
    channels: string[];
    duration: number; // segundos
  };
  
  // Razón
  reason: {
    primary: string;
    description: string;
    ruleViolated: string;
    evidence: string[];
  };
  
  // Historial
  history: {
    previousMutes: number;
    lastMuteAt?: number;
    muteCount: number;
  };
  
  // Estado
  status: {
    active: boolean;
    startedAt: number;
    endsAt: number;
    appealed: boolean;
    appealStatus?: 'pending' | 'approved' | 'denied';
  };
}

// ============================================
// REGLAS PREDEFINIDAS
// ============================================
export const DEFAULT_MODERATION_RULES: ModerationRule[] = [
  {
    id: 'rule_harassment',
    name: 'Acoso',
    description: 'Contenido que acosa o intimida a otros jugadores',
    appliesTo: ['chat_message', 'player_name', 'custom_message', 'profile_bio'],
    detection: {
      type: 'semantic',
      pattern: 'harassment_v1',
      caseSensitive: false,
      language: ['es', 'en']
    },
    action: {
      type: 'warn',
      message: 'Tu mensaje puede ser considerado acoso. Por favor, sé respetuoso.'
    },
    severity: 'high',
    config: {
      enabled: true,
      autoAction: true,
      requireReview: false,
      trustedUserBypass: false,
      contextAware: true
    }
  },
  {
    id: 'rule_hate_speech',
    name: 'Discurso de Odio',
    description: 'Contenido que promueve odio contra grupos protegidos',
    appliesTo: ['chat_message', 'player_name', 'corp_name', 'alliance_name', 'profile_bio'],
    detection: {
      type: 'semantic',
      pattern: 'hate_speech_v2',
      caseSensitive: false,
      language: ['es', 'en', 'de', 'fr', 'it', 'pt']
    },
    action: {
      type: 'mute',
      duration: 86400,
      message: 'Has sido silenciado por discurso de odio.'
    },
    severity: 'severe',
    config: {
      enabled: true,
      autoAction: true,
      requireReview: true,
      trustedUserBypass: false,
      contextAware: true
    }
  },
  {
    id: 'rule_spam',
    name: 'Spam',
    description: 'Mensajes repetitivos o no solicitados',
    appliesTo: ['chat_message', 'forum_post', 'comment'],
    detection: {
      type: 'regex',
      pattern: '(.)\\1{10,}|^[A-Z\s]{20,}$',
      caseSensitive: false,
      language: ['es', 'en']
    },
    action: {
      type: 'block',
      message: 'Mensaje bloqueado por spam.'
    },
    severity: 'medium',
    config: {
      enabled: true,
      autoAction: true,
      requireReview: false,
      trustedUserBypass: true,
      contextAware: false
    }
  },
  {
    id: 'rule_advertising',
    name: 'Publicidad',
    description: 'Publicidad no autorizada de productos externos',
    appliesTo: ['chat_message', 'profile_bio', 'forum_post'],
    detection: {
      type: 'regex',
      pattern: '(?:https?://|www\\.)[^\\s]+|discord\\.gg|twitch\\.tv',
      caseSensitive: false,
      language: ['es', 'en']
    },
    action: {
      type: 'mask',
      message: 'Enlaces externos no permitidos.'
    },
    severity: 'low',
    config: {
      enabled: true,
      autoAction: true,
      requireReview: false,
      trustedUserBypass: true,
      contextAware: false
    }
  }
];

// ============================================
// CATEGORÍAS DE TICKETS
// ============================================
export const TICKET_CATEGORIES: Record<string, { name: string; description: string; sla: number; autoResponse: string }> = {
  bug: {
    name: 'Error/bug',
    description: 'Reportar errores técnicos del juego',
    sla: 172800000, // 2 días
    autoResponse: 'Gracias por reportar este error. Nuestro equipo técnico lo investigará.'
  },
  account: {
    name: 'Cuenta',
    description: 'Problemas con la cuenta de usuario',
    sla: 86400000, // 1 día
    autoResponse: 'Hemos recibido tu solicitud de soporte de cuenta.'
  },
  billing: {
    name: 'Facturación',
    description: 'Problemas con pagos o compras',
    sla: 43200000, // 12 horas
    autoResponse: 'Tu consulta de facturación está siendo procesada con prioridad.'
  },
  harassment: {
    name: 'Acoso',
    description: 'Reportar acoso de otros jugadores',
    sla: 86400000, // 1 día
    autoResponse: 'Tomamos reportes de acoso muy seriamente. Será investigado.'
  },
  cheating: {
    name: 'Trampas',
    description: 'Reportar uso de trampas',
    sla: 172800000, // 2 días
    autoResponse: 'Gracias por ayudarnos a mantener el juego justo.'
  },
  technical: {
    name: 'Técnico',
    description: 'Problemas de rendimiento o conectividad',
    sla: 86400000, // 1 día
    autoResponse: 'Adjunta logs del juego para ayudarnos a diagnosticar.'
  },
  feedback: {
    name: 'Feedback',
    description: 'Sugerencias y comentarios',
    sla: 259200000, // 3 días
    autoResponse: 'Agradecemos tu feedback! Lo revisaremos pronto.'
  },
  other: {
    name: 'Otro',
    description: 'Consultas que no encajan en otras categorías',
    sla: 172800000, // 2 días
    autoResponse: 'Hemos recibido tu consulta y será atendida pronto.'
  }
};

// ============================================
// HELPERS
// ============================================
export function checkContentAgainstRules(
  content: string,
  contentType: ModerationContentType,
  rules: ModerationRule[],
  userTrust: number
): ModeratedContent['result'] {
  const applicableRules = rules.filter(r => 
    r.config.enabled && 
    r.appliesTo.includes(contentType) &&
    (userTrust < 80 || !r.config.trustedUserBypass)
  );
  
  const triggeredRules: string[] = [];
  let maxSeverity: ModerationSeverity = 'low';
  let action: ModerationRule['action']['type'] = 'allow';
  
  for (const rule of applicableRules) {
    // Simular detección (en producción usaría ML/regex real)
    const detected = simulateDetection(content, rule);
    
    if (detected) {
      triggeredRules.push(rule.id);
      
      // Actualizar severidad máxima
      const severityOrder = ['low', 'medium', 'high', 'severe'];
      if (severityOrder.indexOf(rule.severity) > severityOrder.indexOf(maxSeverity)) {
        maxSeverity = rule.severity;
      }
      
      // Actualizar acción
      const actionOrder = ['warn', 'mask', 'block', 'mute', 'kick', 'ban'];
      if (actionOrder.indexOf(rule.action.type) > actionOrder.indexOf(action)) {
        action = rule.action.type;
      }
    }
  }
  
  return {
    actionTaken: action,
    ruleTriggered: triggeredRules,
    severity: maxSeverity,
    confidence: triggeredRules.length > 0 ? 0.8 : 1,
    blocked: action === 'block' || action === 'mute' || action === 'kick' || action === 'ban',
    maskedContent: action === 'mask' ? maskContent(content) : undefined,
    allowed: triggeredRules.length === 0
  };
}

function simulateDetection(content: string, rule: ModerationRule): boolean {
  // En producción, esto usaría ML/regex real
  // Simulación simple para desarrollo
  return false;
}

function maskContent(content: string): string {
  return content.replace(/[aeiou]/gi, '*');
}

export function calculateTicketPriority(
  category: SupportTicket['category'],
  requester: SupportTicket['requester'],
  description: string
): SupportTicket['priority'] {
  // Categorías urgentes
  if (category === 'billing') return 'high';
  if (category === 'harassment') return 'high';
  
  // Keywords urgentes
  const urgentKeywords = ['hackeado', 'robado', 'ban injusto', 'no puedo jugar'];
  if (urgentKeywords.some(k => description.toLowerCase().includes(k))) {
    return 'urgent';
  }
  
  // Usuarios de larga data
  if (requester.accountAge > 365) {
    return 'medium';
  }
  
  return 'low';
}

export function assignTicket(ticket: SupportTicket, team: ModerationTeam[]): ModerationTeam | null {
  const available = team.filter(m => 
    m.availability.currentStatus === 'online' &&
    m.stats.ticketsHandled < m.availability.maxTicketsPerDay &&
    m.moderator.languages.some(l => ticket.description.toLowerCase().includes(l))
  );
  
  if (available.length === 0) return null;
  
  // Asignar al moderador con menos tickets
  return available.sort((a, b) => a.stats.ticketsHandled - b.stats.ticketsHandled)[0];
}

export function escalateTicket(ticket: SupportTicket, reason: string): void {
  ticket.status.state = 'escalated';
  ticket.assignment.escalatedTo = 'senior_moderator';
  ticket.assignment.escalationReason = reason;
  ticket.status.slaDeadline = Date.now() + 86400000; // Reset SLA
}

export function getSLADeadline(category: SupportTicket['category']): number {
  return Date.now() + (TICKET_CATEGORIES[category]?.sla || 172800000);
}

export function isContentAppropriate(
  content: string,
  rules: ModerationRule[]
): { appropriate: boolean; issues: string[] } {
  const issues: string[] = [];
  
  for (const rule of rules) {
    if (!rule.config.enabled) continue;
    
    // Simular detección
    if (simulateDetection(content, rule)) {
      issues.push(rule.name);
    }
  }
  
  return {
    appropriate: issues.length === 0,
    issues
  };
}

export const ModerationSystem = {
  DEFAULT_MODERATION_RULES,
  TICKET_CATEGORIES,
  checkContentAgainstRules,
  calculateTicketPriority,
  assignTicket,
  escalateTicket,
  getSLADeadline,
  isContentAppropriate
};
