import { AgentId, ParsedOrder, SubtaskDefinition, TaskPriority, TaskType } from './taskTypes';
import { PROJECTS } from '../agents/agents';

const PROJECT_KEYWORDS: Record<string, string> = {
  trabajocerca: 'trabajocerca.site',
  'trabaja cerca': 'trabajocerca.site',
  madsjeez: 'madsjeez.com.ar',
  mellimelos: 'mellimelos.site',
  bravura: 'bravura.site',
  appjeez: 'appjeezpro.store',
  'appjeezpro.store': 'appjeezpro.store',
  'appjeezpro.com': 'appjeezpro.com',
  materia: 'materianatural.site',
  materianatural: 'materianatural.site',
  design: 'madsjeezdesign.com',
  madsjeezdesign: 'madsjeezdesign.com',
};

const TYPE_KEYWORDS: Record<string, TaskType> = {
  video: 'video',
  videos: 'video',
  reel: 'video',
  reels: 'video',
  short: 'video',
  shorts: 'video',
  tiktok: 'video',
  seo: 'seo',
  keywords: 'seo',
  keyword: 'seo',
  'trafico organico': 'seo',
  organico: 'seo',
  'articulo': 'content',
  articulos: 'content',
  contenido: 'content',
  content: 'content',
  post: 'content',
  posts: 'content',
  blog: 'content',
  texto: 'content',
  textos: 'content',
  copy: 'content',
  guion: 'content',
  guiones: 'content',
  diseno: 'design',
  banner: 'design',
  banners: 'design',
  carrusel: 'design',
  imagen: 'design',
  imagenes: 'design',
  ads: 'ads',
  anuncio: 'ads',
  anuncios: 'ads',
  publicidad: 'ads',
  campana: 'marketing',
  campanas: 'marketing',
  campaña: 'marketing',
  campañas: 'marketing',
  marketing: 'marketing',
  vendedor: 'marketplace',
  vendedores: 'marketplace',
  marketplace: 'marketplace',
  seller: 'marketplace',
  sellers: 'marketplace',
  automatizacion: 'automation',
  flujo: 'automation',
  bot: 'automation',
  whatsapp: 'automation',
  lead: 'sales',
  leads: 'sales',
  cliente: 'sales',
  clientes: 'sales',
  ventas: 'sales',
  analisis: 'analysis',
  reporte: 'analysis',
  metricas: 'analysis',
};

const AGENT_FOR_TYPE: Record<TaskType, AgentId[]> = {
  video: ['video', 'content', 'marketing'],
  content: ['content', 'seo'],
  seo: ['seo', 'content', 'analysis'],
  design: ['design', 'marketing'],
  ads: ['meta-ads', 'google-ads', 'marketing'],
  marketplace: ['marketplace', 'sales', 'marketing'],
  automation: ['automation', 'sales'],
  sales: ['sales', 'marketing', 'automation'],
  analysis: ['analysis', 'seo'],
  marketing: ['marketing', 'ceo'],
  general: ['ceo', 'marketing'],
};

const PRIORITY_KEYWORDS: Record<TaskPriority, string[]> = {
  urgent: ['urgente', 'ya', 'ahora', 'inmediato', 'inmediatamente', 'emergencia'],
  high: ['hoy', 'rapido', 'rapido', 'prioritario', 'importante'],
  medium: ['pronto', 'esta semana', 'moderado'],
  low: ['cuando puedas', 'sin prisa', 'tranquilo'],
};

function detectProject(message: string, fallback: string): string {
  const lower = message.toLowerCase();
  for (const [keyword, project] of Object.entries(PROJECT_KEYWORDS)) {
    if (lower.includes(keyword)) return project;
  }
  for (const project of PROJECTS) {
    if (lower.includes(project.url)) return project.id;
  }
  return fallback;
}

function detectType(message: string): TaskType {
  const lower = message.toLowerCase();
  for (const [keyword, type] of Object.entries(TYPE_KEYWORDS)) {
    if (lower.includes(keyword)) return type;
  }
  return 'general';
}

function detectQuantity(message: string): number | undefined {
  const match = message.match(/\b(\d+)\b/);
  if (match) {
    const n = parseInt(match[1], 10);
    if (n >= 1 && n <= 100) return n;
  }
  return undefined;
}

function detectPriority(message: string): TaskPriority {
  const lower = message.toLowerCase();
  for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return priority as TaskPriority;
    }
  }
  return 'medium';
}

function extractObjective(message: string, type: TaskType): string {
  const cleaned = message
    .replace(/\b\d+\b/g, '')
    .replace(/\b(para|de|del|los|las|un|una)\b/g, '')
    .trim();

  if (cleaned.length > 10 && cleaned.length < 120) return cleaned;

  const typeLabels: Record<TaskType, string> = {
    video: 'Produccion de videos',
    content: 'Creacion de contenido',
    seo: 'Optimizacion SEO',
    design: 'Diseno visual',
    ads: 'Campanas publicitarias',
    marketplace: 'Gestion de marketplace',
    automation: 'Automatizacion de procesos',
    sales: 'Captacion comercial',
    analysis: 'Analisis y reportes',
    marketing: 'Estrategia de marketing',
    general: 'Tarea general',
  };
  return typeLabels[type];
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function buildSubtasks(type: TaskType, quantity: number | undefined, project: string, objective: string): SubtaskDefinition[] {
  const agents = AGENT_FOR_TYPE[type] ?? ['ceo'];

  if (type === 'seo') {
    return [
      { id: uid(), title: `Auditoria SEO - ${project}`, type: 'seo', agents: ['seo', 'analysis'], description: 'Revision completa del estado SEO actual' },
      { id: uid(), title: `Investigacion de keywords - ${project}`, type: 'seo', agents: ['seo'], description: 'Identificar keywords de alto potencial' },
      { id: uid(), title: quantity ? `Generar ${quantity} articulos` : 'Generar articulos SEO', type: 'content', agents: ['content', 'seo'], description: objective },
    ];
  }

  if (type === 'video') {
    const qty = quantity ?? 5;
    return [
      { id: uid(), title: `Guiones para ${qty} videos - ${project}`, type: 'content', agents: ['content'], description: `Escribir ${qty} guiones con hook y CTA` },
      { id: uid(), title: `Producir ${qty} videos - ${project}`, type: 'video', agents: ['video'], description: objective },
    ];
  }

  if (type === 'marketing') {
    return [
      { id: uid(), title: `Estrategia de campana - ${project}`, type: 'marketing', agents: ['marketing'], description: 'Definir audiencia, mensaje y canales' },
      { id: uid(), title: `Creatividades - ${project}`, type: 'design', agents: ['design'], description: 'Piezas visuales para la campana' },
      { id: uid(), title: `Lanzamiento campana - ${project}`, type: 'ads', agents: ['meta-ads'], description: objective },
    ];
  }

  return agents.slice(0, 2).map((agentId) => ({
    id: uid(),
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${project}`,
    type,
    agents: [agentId],
    description: objective,
  }));
}

export function parseOrder(message: string, selectedProject: string): ParsedOrder {
  const project = detectProject(message, selectedProject);
  const type = detectType(message);
  const quantity = detectQuantity(message);
  const priority = detectPriority(message);
  const objective = extractObjective(message, type);
  const assignedAgents = [...new Set(AGENT_FOR_TYPE[type] ?? ['ceo', 'marketing'])];
  const tasks = buildSubtasks(type, quantity, project, objective);

  return { project, type, quantity, objective, assignedAgents, priority, tasks };
}

export function detectSlashCommand(message: string): string | null {
  const trimmed = message.trim();
  if (trimmed.startsWith('/')) {
    const parts = trimmed.split(' ');
    return parts[0].toLowerCase();
  }
  return null;
}
