/**
 * SISTEMA DE DIPLOMACIA - GALAXY ONLINE II
 * Tratados, alianzas temporales, comercio entre corps, embajadas
 */

// ============================================
// TIPOS DE RELACIONES DIPLOMÁTICAS
// ============================================
export type DiplomaticRelation = 
  | 'war'           // Guerra
  | 'hostile'       // Hostil
  | 'unfriendly'    // No amistoso
  | 'neutral'       // Neutral
  | 'friendly'      // Amistoso
  | 'allied'        // Aliado
  | 'confederation' // Confederación (máxima alianza)
  | 'vassal'        // Vasallo (subordinado)
  | 'protectorate'; // Protectorado (subordinado pero protegido)

export type DiplomaticAction = 
  | 'declare_war'
  | 'sue_for_peace'
  | 'offer_tribute'
  | 'demand_tribute'
  | 'propose_alliance'
  | 'break_alliance'
  | 'propose_trade'
  | 'cancel_trade'
  | 'protectorate'
  | 'vassalize'
  | 'grant_independence'
  | 'embassy_open'
  | 'embassy_close'
  | 'insult'
  | 'compliment'
  | 'send_gift'
  | 'trade_embargo';

// ============================================
// ENTIDADES DIPLOMÁTICAS
// ============================================
export interface DiplomaticEntity {
  id: string;
  name: string;
  type: 'player' | 'corporation' | 'alliance' | 'npc_faction';
  
  // Poder y prestigio
  power: {
    military: number;      // 0-100
    economic: number;      // 0-100
    diplomatic: number;   // 0-100
    total: number;        // 0-100
  };
  
  // Posición política
  alignment: {
    aggressive: number;    // 0-100 (0 pacifista, 100 agresivo)
    expansionist: number;  // 0-100
    isolationist: number;  // 0-100
    trader: number;        // 0-100
  };
  
  // Relaciones actuales
  relations: DiplomaticRelationEntry[];
  
  // Reputación global
  reputation: {
    trustworthiness: number;  // 0-100
    honor: number;          // 0-100
    fear: number;           // 0-100
    respect: number;        // 0-100
  };
  
  // Tratados activos
  activeTreaties: Treaty[];
  
  // Historial diplomático
  history: DiplomaticHistoryEntry[];
}

export interface DiplomaticRelationEntry {
  targetId: string;
  targetName: string;
  targetType: DiplomaticEntity['type'];
  
  // Relación actual
  relation: DiplomaticRelation;
  
  // Opinión (-100 a +100)
  opinion: number;
  
  // Factores de opinión
  opinionModifiers: OpinionModifier[];
  
  // Tratados activos con esta entidad
  treaties: Treaty[];
  
  // Última interacción
  lastInteraction: number;
  
  // Embajada
  embassy: Embassy | null;
}

export interface OpinionModifier {
  id: string;
  name: string;
  description: string;
  value: number; // -50 a +50
  decay: number; // por mes
  permanent: boolean;
  expiresAt?: number;
}

// ============================================
// TRATADOS DIPLOMÁTICOS
// ============================================
export interface Treaty {
  id: string;
  type: TreatyType;
  name: string;
  
  // Partes involucradas
  parties: {
    id: string;
    name: string;
    accepted: boolean;
    acceptedAt?: number;
  }[];
  
  // Términos
  terms: TreatyTerm[];
  
  // Duración
  duration: {
    indefinite: boolean;
    startDate: number;
    endDate?: number;
    breakNoticePeriod: number; // horas
  };
  
  // Estado
  status: 'proposed' | 'negotiating' | 'active' | 'violated' | 'expired' | 'broken';
  
  // Penalizaciones por ruptura
  breakPenalty: {
    reputationLoss: number;
    creditsPenalty: number;
    casusBelli: boolean; // Justificación para guerra
  };
  
  // Historial de cumplimiento
  compliance: {
    partyId: string;
    violations: number;
    warnings: number;
  }[];
}

export type TreatyType = 
  | 'non_aggression'    // Pacto de no agresión
  | 'trade'            // Acuerdo comercial
  | 'defensive'        // Alianza defensiva
  | 'offensive'        // Alianza ofensiva
  | 'full_alliance'    // Alianza total
  | 'vassalage'        // Acuerdo de vasallaje
  | 'protectorate'     // Acuerdo de protectorado
  | 'trade_embargo'    // Embargo comercial (contra terceros)
  | 'research_sharing' // Compartir investigación
  | 'military_access'  // Acceso militar
  | 'border_guarantee' // Garantía de fronteras
  | 'war_reparations'; // Reparaciones de guerra

export interface TreatyTerm {
  id: string;
  category: 'military' | 'economic' | 'territorial' | 'diplomatic' | 'other';
  description: string;
  
  // Obligaciones
  obligations: {
    partyId: string;
    action: string;
    condition?: string;
    deadline?: number;
  }[];
  
  // Beneficios
  benefits: {
    partyId: string;
    type: string;
    value: number;
    duration: number;
  }[];
  
  // Verificable
  verifiable: boolean;
  verificationMethod?: string;
}

// ============================================
// EMBAJADAS
// ============================================
export interface Embassy {
  id: string;
  hostId: string;     // Quién hospeda
  guestId: string;    // Quién tiene la embajada
  
  // Ubicación
  location: {
    systemId: string;
    planetId?: string;
    stationId?: string;
  };
  
  // Nivel de embajada
  level: number; // 1-5
  maxLevel: number;
  
  // Beneficios por nivel
  benefitsByLevel: {
    level: number;
    tradeBonus: number;
    intelSharing: number;
    diplomaticRange: number;
    opinionBoost: number;
  }[];
  
  // Personal
  staff: {
    ambassador: string;
    diplomats: number;
    guards: number;
    spies: number; // Infiltrados disfrazados
  };
  
  // Costos
  maintenanceCost: { credits: number; per: 'day' };
  upgradeCost: { credits: number; metal: number; plasma: number }[];
  
  // Estado
  status: 'active' | 'sieged' | 'evacuated' | 'closed';
  
  // Última actividad diplomática
  lastDiplomaticActivity: number;
}

// ============================================
// COMERCIO INTER-CORPORATIVO
// ============================================
export interface TradeAgreement {
  id: string;
  name: string;
  
  // Partes
  exporters: TradeParty[];
  importers: TradeParty[];
  
  // Rutas comerciales
  routes: TradeRoute[];
  
  // Bienes comerciados
  goods: TradeGood[];
  
  // Términos
  terms: {
    tariffRate: number; // 0-0.5 (50%)
    quotaLimit: number; // máximo por período
    priceModifier: number; // +/- porcentaje
    exclusive: boolean; // solo pueden comerciar entre ellos
  };
  
  // Duración
  duration: {
    start: number;
    end: number;
    renewable: boolean;
  };
  
  // Estadísticas
  stats: {
    totalVolume: number;
    totalValue: number;
    lastTradeAt: number;
    tradesCompleted: number;
    disputes: number;
  };
}

export interface TradeParty {
  entityId: string;
  entityName: string;
  role: 'exporter' | 'importer' | 'both';
  
  // Capacidad
  capacity: {
    maxShips: number;
    maxVolume: number;
    currentLoad: number;
  };
  
  // Reputación comercial
  tradeReputation: number; // 0-100
  
  // Bonos
  bonuses: {
    priceDiscount: number;
    tariffReduction: number;
    speedBonus: number;
  };
}

export interface TradeRoute {
  id: string;
  name: string;
  
  // Origen y destino
  origin: { systemId: string; stationId?: string };
  destination: { systemId: string; stationId?: string };
  
  // Distancia y tiempo
  distance: number; // unidades
  baseTravelTime: number; // segundos
  
  // Seguridad
  security: {
    piracyRisk: number; // 0-1
    patrolPresence: number; // 0-1
    lastPirateAttack?: number;
  };
  
  // Estado
  status: 'active' | 'blocked' | 'dangerous' | 'closed';
  
  // Caravanas activas
  activeCaravans: number;
  maxCaravans: number;
}

export interface TradeGood {
  id: string;
  name: string;
  type: 'resource' | 'component' | 'technology' | 'ship' | 'module' | 'luxury';
  
  // Precios
  basePrice: number;
  currentPrice: number;
  priceHistory: { timestamp: number; price: number }[];
  
  // Volumen
  volumePerUnit: number; // espacio de carga
  
  // Demanda y oferta
  supply: {
    [locationId: string]: {
      available: number;
      productionRate: number;
      lastUpdate: number;
    };
  };
  demand: {
    [locationId: string]: {
      requested: number;
      consumptionRate: number;
      lastUpdate: number;
    };
  };
  
  // Impuestos
  taxRate: number;
  restricted: boolean; // requiere permiso especial
}

// ============================================
// MERCADO INTERESTELAR
// ============================================
export interface InterstellarMarket {
  id: string;
  name: string;
  location: { systemId: string; stationId: string };
  
  // Tipo de mercado
  type: 'free_market' | 'regulated' | 'black_market' | 'corporate_monopoly';
  
  // Participantes
  participants: string[]; // IDs de corps/jugadores
  
  // Ofertas activas
  buyOrders: MarketOrder[];
  sellOrders: MarketOrder[];
  
  // Estadísticas
  volume24h: number;
  trades24h: number;
  avgPriceChange: number; // porcentaje
  
  // Comisiones
  fees: {
    listing: number; // porcentaje
    transaction: number; // porcentaje
    withdrawal: number; // porcentaje
  };
  
  // Regulaciones
  regulations: {
    minPrice: number;
    maxPrice: number;
    maxOrderSize: number;
    requiredReputation: number;
  };
}

export interface MarketOrder {
  id: string;
  type: 'buy' | 'sell';
  
  // Quién
  ownerId: string;
  ownerName: string;
  
  // Qué
  goodId: string;
  goodName: string;
  quantity: number;
  
  // Precio
  pricePerUnit: number;
  totalPrice: number;
  
  // Condiciones
  instant: boolean; // orden de mercado
  minReputation?: number; // solo vender/comprar a cierta reputación
  
  // Tiempo
  createdAt: number;
  expiresAt?: number;
  
  // Estado
  status: 'active' | 'partial' | 'filled' | 'cancelled' | 'expired';
  filledQuantity: number;
}

// ============================================
// HISTORIAL DIPLOMÁTICO
// ============================================
export interface DiplomaticHistoryEntry {
  id: string;
  timestamp: number;
  
  // Tipo de evento
  type: 'war_declared' | 'peace_signed' | 'treaty_signed' | 'treaty_broken' |
        'alliance_formed' | 'alliance_broken' | 'trade_started' | 'trade_ended' |
        'insult' | 'compliment' | 'gift' | 'embassy_opened' | 'embassy_closed' |
        'vassalization' | 'independence_granted' | 'tribute_paid';
  
  // Actores
  actorId: string;
  targetId: string;
  
  // Detalles
  description: string;
  impact: {
    opinionChange: number;
    reputationChange: number;
    powerChange: number;
  };
  
  // Datos adicionales
  metadata: Record<string, any>;
}

// ============================================
// ACCIONES DIPLOMÁTICAS Y SUS EFECTOS
// ============================================
export const DIPLOMATIC_ACTIONS: Partial<Record<DiplomaticAction, {
  name: string;
  description: string;
  baseOpinionChange: number;
  cooldown: number; // horas
  requirements: {
    minOpinion?: number;
    maxOpinion?: number;
    relationTypes: DiplomaticRelation[];
    powerRatio?: number; // attacker/defender
  };
  costs: {
    credits?: number;
    influence?: number;
    energy?: number;
  };
  effects: {
    relationChange?: DiplomaticRelation;
    trustChange?: number;
    fearChange?: number;
  };
}>> = {
  declare_war: {
    name: 'Declarar Guerra',
    description: 'Inicia un estado de guerra hostil',
    baseOpinionChange: -50,
    cooldown: 168, // 1 semana
    requirements: {
      relationTypes: ['hostile', 'unfriendly', 'neutral', 'friendly', 'allied'],
    },
    costs: { credits: 100000, influence: 500 },
    effects: { relationChange: 'war', trustChange: -30, fearChange: 20 }
  },
  
  propose_alliance: {
    name: 'Proponer Alianza',
    description: 'Ofrece una alianza formal',
    baseOpinionChange: 10,
    cooldown: 72,
    requirements: {
      minOpinion: 50,
      relationTypes: ['friendly'],
    },
    costs: { credits: 50000, influence: 200 },
    effects: { relationChange: 'allied' }
  },
  
  propose_trade: {
    name: 'Proponer Acuerdo Comercial',
    description: 'Establece rutas comerciales',
    baseOpinionChange: 5,
    cooldown: 24,
    requirements: {
      minOpinion: -20,
      relationTypes: ['neutral', 'friendly', 'allied'],
    },
    costs: { credits: 10000 },
    effects: {}
  },
  
  send_gift: {
    name: 'Enviar Regalo',
    description: 'Mejora las relaciones con un obsequio',
    baseOpinionChange: 15,
    cooldown: 24,
    requirements: {
      relationTypes: ['unfriendly', 'neutral', 'friendly', 'allied'],
    },
    costs: { credits: 50000 },
    effects: { trustChange: 5 }
  },
  
  insult: {
    name: 'Insultar',
    description: 'Provoca deliberadamente al objetivo',
    baseOpinionChange: -20,
    cooldown: 48,
    requirements: {
      relationTypes: ['unfriendly', 'neutral', 'friendly', 'allied'],
    },
    costs: { influence: 50 },
    effects: { fearChange: -10 }
  },
  
  embassy_open: {
    name: 'Abrir Embajada',
    description: 'Establece presencia diplomática permanente',
    baseOpinionChange: 25,
    cooldown: 168,
    requirements: {
      minOpinion: 0,
      relationTypes: ['neutral', 'friendly', 'allied'],
    },
    costs: { credits: 200000, energy: 500 },
    effects: { trustChange: 10 }
  },
  
  sue_for_peace: {
    name: 'Solicitar Paz',
    description: 'Propone terminar la guerra',
    baseOpinionChange: 5,
    cooldown: 24,
    requirements: {
      relationTypes: ['war'],
    },
    costs: { influence: 100 },
    effects: { relationChange: 'neutral' }
  },
  
  offer_tribute: {
    name: 'Ofrecer Tributo',
    description: 'Paga tributo para evitar conflicto',
    baseOpinionChange: 10,
    cooldown: 168,
    requirements: {
      maxOpinion: 0,
      relationTypes: ['hostile', 'unfriendly', 'war'],
    },
    costs: { credits: 300000 },
    effects: { fearChange: 15 }
  },
  
  vassalize: {
    name: 'Vasallizar',
    description: 'Impone subordinación por fuerza o diplomacia',
    baseOpinionChange: -30,
    cooldown: 720,
    requirements: {
      powerRatio: 3.0, // 3x más poderoso
      relationTypes: ['war', 'hostile'],
    },
    costs: { credits: 500000, influence: 1000 },
    effects: { relationChange: 'vassal' }
  },
  
  break_alliance: {
    name: 'Romper Alianza',
    description: 'Termina un pacto de alianza',
    baseOpinionChange: -40,
    cooldown: 336,
    requirements: {
      relationTypes: ['allied', 'confederation'],
    },
    costs: { influence: 200 },
    effects: { relationChange: 'neutral', trustChange: -50 }
  },
  
  trade_embargo: {
    name: 'Embargo Comercial',
    description: 'Bloquea comercio con entidad específica',
    baseOpinionChange: -25,
    cooldown: 72,
    requirements: {
      relationTypes: ['hostile', 'unfriendly', 'neutral', 'friendly'],
    },
    costs: { credits: 50000, influence: 300 },
    effects: { trustChange: -20 }
  }
};

// ============================================
// TRATADOS PREDEFINIDOS
// ============================================
export const STANDARD_TREATIES: Partial<Treaty>[] = [
  {
    id: 'treaty_non_aggression',
    type: 'non_aggression',
    name: 'Pacto de No Agresión',
    terms: [
      {
        id: 'term_no_attack',
        category: 'military',
        description: 'Ninguna parte atacará a la otra',
        obligations: [],
        benefits: [],
        verifiable: true,
        verificationMethod: 'monitoring_attacks'
      }
    ],
    duration: { indefinite: false, startDate: 0, endDate: 0, breakNoticePeriod: 168 },
    breakPenalty: { reputationLoss: 30, creditsPenalty: 100000, casusBelli: true }
  },
  {
    id: 'treaty_defensive_alliance',
    type: 'defensive',
    name: 'Alianza Defensiva',
    terms: [
      {
        id: 'term_defend',
        category: 'military',
        description: 'Si una parte es atacada, la otra debe defenderla',
        obligations: [],
        benefits: [],
        verifiable: true,
        verificationMethod: 'fleet_deployment_check'
      }
    ],
    duration: { indefinite: false, startDate: 0, endDate: 0, breakNoticePeriod: 336 },
    breakPenalty: { reputationLoss: 50, creditsPenalty: 500000, casusBelli: true }
  },
  {
    id: 'treaty_trade_agreement',
    type: 'trade',
    name: 'Acuerdo Comercial Estándar',
    terms: [
      {
        id: 'term_reduced_tariffs',
        category: 'economic',
        description: 'Aranceles reducidos al 5%',
        obligations: [],
        benefits: [],
        verifiable: true,
        verificationMethod: 'trade_records'
      }
    ],
    duration: { indefinite: false, startDate: 0, endDate: 0, breakNoticePeriod: 72 },
    breakPenalty: { reputationLoss: 15, creditsPenalty: 50000, casusBelli: false }
  },
  {
    id: 'treaty_research_sharing',
    type: 'research_sharing',
    name: 'Compartir Investigación',
    terms: [
      {
        id: 'term_tech_share',
        category: 'other',
        description: 'Ambas partes comparten progreso de investigación',
        obligations: [],
        benefits: [],
        verifiable: true,
        verificationMethod: 'research_speed_comparison'
      }
    ],
    duration: { indefinite: false, startDate: 0, endDate: 0, breakNoticePeriod: 168 },
    breakPenalty: { reputationLoss: 20, creditsPenalty: 100000, casusBelli: false }
  }
];

// ============================================
// HELPERS
// ============================================
export function calculateOpinion(
  baseOpinion: number,
  modifiers: OpinionModifier[]
): number {
  let total = baseOpinion;
  modifiers.forEach(mod => {
    total += mod.value * (mod.permanent ? 1 : Math.max(0.1, 1 - (Date.now() - (mod.expiresAt || Date.now())) / (30 * 24 * 60 * 60 * 1000)));
  });
  return Math.max(-100, Math.min(100, total));
}

export function canPerformAction(
  action: DiplomaticAction,
  actor: DiplomaticEntity,
  target: DiplomaticEntity,
  currentRelation: DiplomaticRelation
): { canDo: boolean; reason?: string } {
  const actionDef = DIPLOMATIC_ACTIONS[action];
  if (!actionDef) {
    return { canDo: false, reason: 'Acción no definida' };
  }

  // Verificar requisitos de relación
  if (!actionDef.requirements.relationTypes.includes(currentRelation)) {
    return { canDo: false, reason: `Relación actual (${currentRelation}) no permite esta acción` };
  }
  
  // Verificar opinión mínima
  const relationEntry = actor.relations.find(r => r.targetId === target.id);
  if (actionDef.requirements.minOpinion !== undefined) {
    if (!relationEntry || relationEntry.opinion < actionDef.requirements.minOpinion) {
      return { canDo: false, reason: `Opinión insuficiente (${relationEntry?.opinion || 0} < ${actionDef.requirements.minOpinion})` };
    }
  }
  
  // Verificar ratio de poder
  if (actionDef.requirements.powerRatio !== undefined) {
    const ratio = actor.power.total / (target.power.total || 1);
    if (ratio < actionDef.requirements.powerRatio) {
      return { canDo: false, reason: `Poder insuficiente (${ratio.toFixed(2)}x vs ${actionDef.requirements.powerRatio}x requerido)` };
    }
  }
  
  // Verificar cooldown
  const lastInteraction = relationEntry?.lastInteraction || 0;
  const cooldownMs = actionDef.cooldown * 60 * 60 * 1000;
  if (Date.now() - lastInteraction < cooldownMs) {
    const hoursLeft = Math.ceil((cooldownMs - (Date.now() - lastInteraction)) / (60 * 60 * 1000));
    return { canDo: false, reason: `En cooldown (${hoursLeft} horas restantes)` };
  }
  
  return { canDo: true };
}

export function getTreatyByType(type: TreatyType): Partial<Treaty> | undefined {
  return STANDARD_TREATIES.find(t => t.type === type);
}

export function calculateTradeProfit(
  route: TradeRoute,
  good: TradeGood,
  quantity: number
): { gross: number; net: number; profit: number } {
  const originPrice = good.supply[route.origin.systemId]?.available 
    ? good.basePrice * 0.9 // Precio de compra
    : good.basePrice;
    
  const destPrice = good.demand[route.destination.systemId]?.requested
    ? good.basePrice * 1.3 // Precio de venta
    : good.basePrice * 1.1;
  
  const gross = (destPrice - originPrice) * quantity;
  const costs = route.distance * 0.1 * quantity; // Costos de transporte
  const net = gross - costs;
  
  return { gross, net, profit: (net / (originPrice * quantity)) * 100 };
}

export const DiplomacySystem = {
  DIPLOMATIC_ACTIONS,
  STANDARD_TREATIES,
  calculateOpinion,
  canPerformDiplomaticAction: canPerformAction,
  getTreatyByType,
  calculateDiplomaticTradeProfit: calculateTradeProfit
};
