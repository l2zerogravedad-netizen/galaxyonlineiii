/**
 * SISTEMA SOCIAL - GALAXY ONLINE II
 * Amigos, chat, mensajería, bloqueos y reputación
 */

// ============================================
// ESTADOS DE AMISTAD
// ============================================
export type FriendStatus = 'pending_sent' | 'pending_received' | 'accepted' | 'blocked';

export interface Friend {
  id: string;
  playerId: string;
  playerName: string;
  level: number;
  corpName?: string;
  status: FriendStatus;
  online: boolean;
  lastSeen: number;
  friendshipDate: number;
  favorite: boolean;
  note?: string;
}

// ============================================
// SISTEMA DE CHAT
// ============================================
export type ChatChannel = 
  | 'global' 
  | 'corp' 
  | 'alliance' 
  | 'private' 
  | 'system' 
  | 'trade'
  | 'recruitment'
  | 'help';

export interface ChatMessage {
  id: string;
  channel: ChatChannel;
  senderId: string;
  senderName: string;
  senderLevel: number;
  senderTitle?: string;
  content: string;
  timestamp: number;
  isSystem: boolean;
  isModerator: boolean;
  mentions: string[];
  deleted: boolean;
}

export interface ChatChannelInfo {
  id: ChatChannel;
  name: string;
  description: string;
  color: string;
  moderated: boolean;
  levelRequired: number;
  corpOnly: boolean;
}

export const CHAT_CHANNELS: ChatChannelInfo[] = [
  { id: 'global', name: 'Global', description: 'Chat de todos los jugadores', color: '#FFFFFF', moderated: true, levelRequired: 1, corpOnly: false },
  { id: 'corp', name: 'Corporación', description: 'Chat privado de tu corp', color: '#00FF00', moderated: false, levelRequired: 1, corpOnly: true },
  { id: 'alliance', name: 'Alianza', description: 'Chat de tu alianza de corps', color: '#FFFF00', moderated: false, levelRequired: 1, corpOnly: true },
  { id: 'trade', name: 'Comercio', description: 'Ofertas de comercio', color: '#FFA500', moderated: true, levelRequired: 5, corpOnly: false },
  { id: 'recruitment', name: 'Reclutamiento', description: 'Reclutamiento de corps', color: '#00CED1', moderated: true, levelRequired: 10, corpOnly: false },
  { id: 'help', name: 'Ayuda', description: 'Preguntas y ayuda', color: '#FF69B4', moderated: true, levelRequired: 1, corpOnly: false },
  { id: 'system', name: 'Sistema', description: 'Mensajes del sistema', color: '#FF0000', moderated: false, levelRequired: 1, corpOnly: false }
];

// ============================================
// SISTEMA DE CORREO
// ============================================
export type MailType = 'system' | 'player' | 'corp' | 'alliance' | 'combat' | 'trade';

export interface MailAttachment {
  type: 'resources' | 'items' | 'commander' | 'ship';
  data: Record<string, unknown>;
}

export interface MailMessage {
  id: string;
  type: MailType;
  fromId: string;
  fromName: string;
  toId: string;
  subject: string;
  content: string;
  timestamp: number;
  read: boolean;
  attachments: MailAttachment[];
  important: boolean;
  expiresAt?: number;
}

export const MAIL_LIMITS = {
  inbox: 100,
  sent: 50,
  archive: 200,
  attachmentExpiryDays: 30
};

// ============================================
// SISTEMA DE BLOQUEO
// ============================================
export interface BlockedPlayer {
  playerId: string;
  playerName: string;
  reason?: string;
  blockedAt: number;
  blockChat: boolean;
  blockMail: boolean;
  blockTrade: boolean;
  blockCorpInvite: boolean;
}

// ============================================
// SISTEMA DE REPUTACIÓN
// ============================================
export type ReputationType = 'honor' | 'notoriety' | 'fame' | 'trust';

export interface Reputation {
  type: ReputationType;
  value: number; // -1000 a 1000
  rank: string;
}

export const REPUTATION_RANKS: Record<ReputationType, { min: number; max: number; ranks: string[] }> = {
  honor: { min: -1000, max: 1000, ranks: ['Despreciable', 'Dudoso', 'Neutral', 'Respetado', 'Honorable', 'Legendario'] },
  notoriety: { min: 0, max: 1000, ranks: ['Desconocido', 'Notorio', 'Infame', 'Temido', 'Odiado'] },
  fame: { min: 0, max: 10000, ranks: ['Desconocido', 'Conocido', 'Famoso', 'Celebridad', 'Superestrella'] },
  trust: { min: -500, max: 500, ranks: ['Traidor', 'Sospechoso', 'Neutral', 'Confiable', 'Leal'] }
};

// ============================================
// SISTEMA DE REFERIDOS
// ============================================
export interface Referral {
  referrerId: string;
  referredId: string;
  referredName: string;
  referredLevel: number;
  rewardsClaimed: {
    level5: boolean;
    level10: boolean;
    level20: boolean;
    level30: boolean;
    level50: boolean;
  };
  totalRewards: number;
  joinDate: number;
}

export const REFERRAL_REWARDS = {
  level5: { credits: 10000, items: ['chest_rare'] },
  level10: { credits: 50000, items: ['chest_epic'] },
  level20: { credits: 100000, items: ['chest_legendary'] },
  level30: { credits: 200000, items: ['chest_legendary', 'chest_legendary'] },
  level50: { credits: 500000, items: ['cmd_legendary_random'] }
};

// ============================================
// HELPERS
// ============================================
export function getChatChannelInfo(channelId: ChatChannel): ChatChannelInfo | undefined {
  return CHAT_CHANNELS.find(c => c.id === channelId);
}

export function canUseChannel(playerLevel: number, channel: ChatChannelInfo): boolean {
  return playerLevel >= channel.levelRequired;
}

export function calculateReputationRank(type: ReputationType, value: number): string {
  const config = REPUTATION_RANKS[type];
  const normalized = (value - config.min) / (config.max - config.min);
  const index = Math.floor(normalized * (config.ranks.length - 1));
  return config.ranks[Math.max(0, Math.min(index, config.ranks.length - 1))];
}

export function getReferralRewards(level: number): typeof REFERRAL_REWARDS[keyof typeof REFERRAL_REWARDS] | null {
  if (level >= 50) return REFERRAL_REWARDS.level50;
  if (level >= 30) return REFERRAL_REWARDS.level30;
  if (level >= 20) return REFERRAL_REWARDS.level20;
  if (level >= 10) return REFERRAL_REWARDS.level10;
  if (level >= 5) return REFERRAL_REWARDS.level5;
  return null;
}

export const SocialSystem = {
  CHAT_CHANNELS,
  MAIL_LIMITS,
  REPUTATION_RANKS,
  REFERRAL_REWARDS,
  getChatChannelInfo,
  canUseChannel,
  calculateReputationRank,
  getReferralRewards
};
