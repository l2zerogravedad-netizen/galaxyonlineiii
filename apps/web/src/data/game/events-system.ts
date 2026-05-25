/**
 * SISTEMA DE EVENTOS TEMPORALES - GALAXY ONLINE II
 * Eventos globales, festivales, competencias y bonus temporales
 */

import type { ResourceKey } from '@/components/game/game-data';

export type EventType = 
  | 'holiday' | 'weekend' | 'seasonal' | 'anniversary' 
  | 'special' | 'competition' | 'maintenance' | 'flash';

export type EventStatus = 'upcoming' | 'active' | 'ended';

export interface EventBonus {
  type: 'resource_production' | 'research_speed' | 'build_speed' | 'ship_build_speed' 
    | 'pvp_honor' | 'drop_rate' | 'gacha_discount' | 'shop_discount' | 'exp_boost';
  target: string;
  value: number;
}

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  type: EventType;
  status: EventStatus;
  startTime: number;
  endTime: number;
  bonuses: EventBonus[];
  icon: string;
  color: string;
}

// ============================================
// EVENTOS ANUALES FIJOS
// ============================================
export const ANNUAL_EVENTS: Omit<GameEvent, 'status' | 'startTime' | 'endTime'>[] = [
  {
    id: 'event_new_year',
    name: 'Año Nuevo Galáctico',
    description: 'Celebra el inicio de un nuevo año con bonus especiales.',
    type: 'holiday',
    bonuses: [
      { type: 'resource_production', target: 'all', value: 50 },
      { type: 'gacha_discount', target: 'all', value: 20 },
      { type: 'exp_boost', target: 'all', value: 100 }
    ],
    icon: '🎆',
    color: '#FFD700'
  },
  {
    id: 'event_valentine',
    name: 'San Valentín Espacial',
    description: 'Evento de amor y amistad con regalos especiales.',
    type: 'holiday',
    bonuses: [
      { type: 'shop_discount', target: 'all', value: 30 },
      { type: 'drop_rate', target: 'chests', value: 50 }
    ],
    icon: '💝',
    color: '#FF69B4'
  },
  {
    id: 'event_spring',
    name: 'Festival de Primavera',
    description: 'Renovación y crecimiento acelerado.',
    type: 'seasonal',
    bonuses: [
      { type: 'build_speed', target: 'all', value: 50 },
      { type: 'research_speed', target: 'all', value: 50 },
      { type: 'resource_production', target: 'all', value: 30 }
    ],
    icon: '🌸',
    color: '#98FB98'
  },
  {
    id: 'event_summer',
    name: 'Verano Galáctico',
    description: 'Evento de verano con competencias especiales.',
    type: 'seasonal',
    bonuses: [
      { type: 'pvp_honor', target: 'all', value: 100 },
      { type: 'ship_build_speed', target: 'all', value: 40 }
    ],
    icon: '☀️',
    color: '#FFA500'
  },
  {
    id: 'event_halloween',
    name: 'Halloween Espacial',
    description: 'Evento de terror con recompensas oscuras.',
    type: 'holiday',
    bonuses: [
      { type: 'drop_rate', target: 'items', value: 100 },
      { type: 'exp_boost', target: 'combat', value: 75 }
    ],
    icon: '🎃',
    color: '#FF8C00'
  },
  {
    id: 'event_thanksgiving',
    name: 'Día de Gracias Galáctico',
    description: 'Agradecimiento con bonus de recursos.',
    type: 'holiday',
    bonuses: [
      { type: 'resource_production', target: 'all', value: 75 },
      { type: 'shop_discount', target: 'all', value: 25 }
    ],
    icon: '🦃',
    color: '#D2691E'
  },
  {
    id: 'event_christmas',
    name: 'Navidad Espacial',
    description: 'El evento más grande del año con regalos diarios.',
    type: 'holiday',
    bonuses: [
      { type: 'resource_production', target: 'all', value: 100 },
      { type: 'gacha_discount', target: 'all', value: 50 },
      { type: 'build_speed', target: 'all', value: 50 },
      { type: 'shop_discount', target: 'all', value: 40 }
    ],
    icon: '🎄',
    color: '#DC143C'
  },
  {
    id: 'event_anniversary',
    name: 'Aniversario Galaxy Online II',
    description: 'Celebración anual del juego.',
    type: 'anniversary',
    bonuses: [
      { type: 'resource_production', target: 'all', value: 100 },
      { type: 'exp_boost', target: 'all', value: 200 },
      { type: 'gacha_discount', target: 'all', value: 30 }
    ],
    icon: '🎂',
    color: '#FFD700'
  }
];

// ============================================
// EVENTOS SEMANALES RECURRENTES
// ============================================
export const WEEKLY_EVENTS: Omit<GameEvent, 'status' | 'startTime' | 'endTime'>[] = [
  {
    id: 'event_weekend_warrior',
    name: 'Guerrero de Fin de Semana',
    description: 'Bonus de combate durante el fin de semana.',
    type: 'weekend',
    bonuses: [
      { type: 'pvp_honor', target: 'all', value: 50 },
      { type: 'exp_boost', target: 'combat', value: 50 }
    ],
    icon: '⚔️',
    color: '#FF4500'
  },
  {
    id: 'event_weekend_builder',
    name: 'Constructor de Fin de Semana',
    description: 'Velocidad de construcción aumentada.',
    type: 'weekend',
    bonuses: [
      { type: 'build_speed', target: 'all', value: 50 },
      { type: 'research_speed', target: 'all', value: 50 }
    ],
    icon: '🏗️',
    color: '#4169E1'
  },
  {
    id: 'event_metal_monday',
    name: 'Lunes de Metal',
    description: 'Producción de metal duplicada.',
    type: 'special',
    bonuses: [
      { type: 'resource_production', target: 'metal', value: 100 }
    ],
    icon: '⛏️',
    color: '#A9A9A9'
  },
  {
    id: 'event_plasma_wednesday',
    name: 'Miércoles de Plasma',
    description: 'Producción de plasma duplicada.',
    type: 'special',
    bonuses: [
      { type: 'resource_production', target: 'plasma', value: 100 }
    ],
    icon: '⚡',
    color: '#00CED1'
  }
];

// ============================================
// EVENTOS FLASH
// ============================================
export const FLASH_EVENTS: Omit<GameEvent, 'status' | 'startTime' | 'endTime'>[] = [
  {
    id: 'flash_gacha_50',
    name: 'Gacha Flash -50%',
    description: 'Descuento flash de 50% en gacha por 2 horas.',
    type: 'flash',
    bonuses: [
      { type: 'gacha_discount', target: 'all', value: 50 }
    ],
    icon: '⚡',
    color: '#FFFF00'
  },
  {
    id: 'flash_resource_surge',
    name: 'Oleada de Recursos',
    description: 'Producción x3 por 1 hora.',
    type: 'flash',
    bonuses: [
      { type: 'resource_production', target: 'all', value: 200 }
    ],
    icon: '💰',
    color: '#32CD32'
  }
];

// ============================================
// COMPETENCIAS
// ============================================
export interface Competition {
  id: string;
  name: string;
  description: string;
  type: 'pvp' | 'pve' | 'resource' | 'building' | 'research';
  duration: number; // horas
  objectives: {
    metric: string;
    target: number;
  }[];
  rewards: {
    rank1: { resources: Record<string, number>; items: string[]; title?: string };
    rank2_10: { resources: Record<string, number>; items: string[]; title?: string };
    rank11_100: { resources: Record<string, number>; items: string[]; title?: string };
    participation: { resources: Record<string, number>; title?: string };
  };
}

export const COMPETITIONS: Competition[] = [
  {
    id: 'comp_pvp_weekly',
    name: 'Liga de Combate Semanal',
    description: 'Compite por el mayor número de victorias PvP.',
    type: 'pvp',
    duration: 168,
    objectives: [{ metric: 'pvp_wins', target: 100 }],
    rewards: {
      rank1: { resources: { credits: 1000000 }, items: ['cmd_legendary', 'chest_divine'], title: 'Campeón de Combate' },
      rank2_10: { resources: { credits: 500000 }, items: ['chest_legendary', 'chest_epic'], title: '' },
      rank11_100: { resources: { credits: 100000 }, items: ['chest_epic'], title: '' },
      participation: { resources: { credits: 10000 } }
    }
  },
  {
    id: 'comp_resource_weekly',
    name: 'Productor de la Semana',
    description: 'Produce la mayor cantidad de recursos.',
    type: 'resource',
    duration: 168,
    objectives: [{ metric: 'resources_produced', target: 10000000 }],
    rewards: {
      rank1: { resources: { credits: 800000 }, items: ['speedup_24h', 'chest_legendary'], title: 'Magnate Industrial' },
      rank2_10: { resources: { credits: 400000 }, items: ['speedup_12h', 'chest_epic'], title: '' },
      rank11_100: { resources: { credits: 80000 }, items: ['speedup_4h'], title: '' },
      participation: { resources: { credits: 5000 } }
    }
  },
  {
    id: 'comp_builder_weekly',
    name: 'Constructor Galáctico',
    description: 'Completa la mayor cantidad de construcciones.',
    type: 'building',
    duration: 168,
    objectives: [{ metric: 'buildings_completed', target: 50 }],
    rewards: {
      rank1: { resources: { credits: 600000 }, items: ['speedup_24h', 'chest_epic'], title: 'Arquitecto Supremo' },
      rank2_10: { resources: { credits: 300000 }, items: ['speedup_12h'], title: '' },
      rank11_100: { resources: { credits: 60000 }, items: ['speedup_1h'], title: '' },
      participation: { resources: { credits: 5000 } }
    }
  },
  {
    id: 'comp_research_weekly',
    name: 'Científico Galáctico',
    description: 'Completa la mayor cantidad de investigaciones.',
    type: 'research',
    duration: 168,
    objectives: [{ metric: 'research_completed', target: 20 }],
    rewards: {
      rank1: { resources: { credits: 600000 }, items: ['chest_legendary'], title: 'Nobel Galáctico' },
      rank2_10: { resources: { credits: 300000 }, items: ['chest_epic'], title: '' },
      rank11_100: { resources: { credits: 60000 }, items: ['chest_rare'], title: '' },
      participation: { resources: { credits: 5000 } }
    }
  }
];

// ============================================
// CALENDARIO DE EVENTOS
// ============================================
export interface EventCalendar {
  year: number;
  month: number;
  events: GameEvent[];
}

export function generateEventCalendar(year: number, month: number): GameEvent[] {
  const events: GameEvent[] = [];
  const now = Date.now();
  
  // Eventos anuales
  ANNUAL_EVENTS.forEach(event => {
    const startDate = getEventDate(year, event.id);
    if (startDate) {
      events.push({
        ...event,
        status: startDate <= now && now <= startDate + 86400000 * 7 ? 'active' : startDate > now ? 'upcoming' : 'ended',
        startTime: startDate,
        endTime: startDate + 86400000 * 7 // 7 días
      });
    }
  });
  
  // Eventos semanales
  WEEKLY_EVENTS.forEach(event => {
    const weekendStart = getNextWeekend();
    events.push({
      ...event,
      status: 'upcoming',
      startTime: weekendStart,
      endTime: weekendStart + 172800000 // 48 horas
    });
  });
  
  return events;
}

function getEventDate(year: number, eventId: string): number | null {
  const dates: Record<string, string> = {
    'event_new_year': `${year}-01-01`,
    'event_valentine': `${year}-02-14`,
    'event_spring': `${year}-03-20`,
    'event_summer': `${year}-06-21`,
    'event_halloween': `${year}-10-31`,
    'event_thanksgiving': `${year}-11-25`,
    'event_christmas': `${year}-12-25`,
    'event_anniversary': `${year}-06-01` // Fecha del lanzamiento
  };
  
  const dateStr = dates[eventId];
  return dateStr ? new Date(dateStr).getTime() : null;
}

function getNextWeekend(): number {
  const now = new Date();
  const day = now.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7 || 7;
  now.setDate(now.getDate() + daysUntilSaturday);
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

// ============================================
// HELPERS
// ============================================
export function getActiveBonuses(events: GameEvent[]): EventBonus[] {
  const activeEvents = events.filter(e => e.status === 'active');
  return activeEvents.flatMap(e => e.bonuses);
}

export function calculateBonusValue(
  bonuses: EventBonus[],
  type: EventBonus['type'],
  target: string,
  baseValue: number
): number {
  const relevantBonuses = bonuses.filter(b => b.type === type && (b.target === target || b.target === 'all'));
  const totalBonus = relevantBonuses.reduce((sum, b) => sum + b.value, 0);
  return baseValue * (1 + totalBonus / 100);
}

export const EventsSystem = {
  ANNUAL_EVENTS,
  WEEKLY_EVENTS,
  FLASH_EVENTS,
  COMPETITIONS,
  generateEventCalendar,
  getActiveBonuses,
  calculateBonusValue
};
