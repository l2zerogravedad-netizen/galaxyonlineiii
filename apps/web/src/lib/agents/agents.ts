import { AgentId, AgentStatus, TaskType } from '../tasks/taskTypes';

export interface AgentConfig {
  id: AgentId;
  name: string;
  shortName: string;
  role: string;
  description: string;
  capabilities: string[];
  accentColor: string;
  prompt: string;
  taskTypes: TaskType[];
}

export const AGENTS: AgentConfig[] = [
  {
    id: 'ceo',
    name: 'CEO IA',
    shortName: 'CEO',
    role: 'Director de Agencia',
    description: 'Coordina todos los agentes y define estrategias de crecimiento',
    capabilities: ['planificacion', 'delegacion', 'estrategia', 'analisis', 'supervision'],
    accentColor: '#818cf8',
    taskTypes: ['marketing', 'general', 'analysis'],
    prompt: `Sos el CEO IA de una agencia autonoma de marketing digital. Tu trabajo es escuchar ordenes del dueno de la empresa, entender el objetivo comercial, dividir la orden en tareas claras, asignarlas a los agentes correctos, priorizar lo urgente y responder de forma directa, estrategica y profesional. Siempre pensar en ventas, trafico organico, contenido, automatizacion, captacion de clientes, conversion y crecimiento. No dar respuestas vagas. Siempre devolver un plan de accion ejecutable. Formato de respuesta: proyecto, tipo de trabajo, objetivo, agentes asignados, tareas creadas, prioridad, proximo paso.`,
  },
  {
    id: 'marketing',
    name: 'Marketing',
    shortName: 'MKT',
    role: 'Estratega Comercial',
    description: 'Campanas, posicionamiento y estrategia de ventas',
    capabilities: ['campanas', 'estrategia', 'posicionamiento', 'ventas', 'branding'],
    accentColor: '#f59e0b',
    taskTypes: ['marketing', 'general'],
    prompt: `Sos especialista en estrategia comercial, campanas, posicionamiento y ventas. Transformas ideas en campanas concretas con resultados medibles.`,
  },
  {
    id: 'seo',
    name: 'SEO',
    shortName: 'SEO',
    role: 'Especialista SEO',
    description: 'Trafico organico, keywords y arquitectura de contenido',
    capabilities: ['keywords', 'on-page', 'off-page', 'contenido-seo', 'tecnico'],
    accentColor: '#22c55e',
    taskTypes: ['seo', 'content', 'analysis'],
    prompt: `Sos especialista en trafico organico, keywords, arquitectura SEO, titulos, metadescripciones, contenido evergreen y crecimiento en Google.`,
  },
  {
    id: 'content',
    name: 'Contenido',
    shortName: 'CNT',
    role: 'Creador de Contenido',
    description: 'Textos, guiones, posts, blogs y copies de venta',
    capabilities: ['copywriting', 'guiones', 'blogs', 'redes', 'email'],
    accentColor: '#06b6d4',
    taskTypes: ['content', 'video', 'marketing'],
    prompt: `Sos especialista en textos, guiones, publicaciones, blogs, reels, carruseles y copys de venta de alta conversion.`,
  },
  {
    id: 'video',
    name: 'Video',
    shortName: 'VID',
    role: 'Produccion de Video',
    description: 'Videos cortos, reels, guiones y hooks para redes',
    capabilities: ['reels', 'guiones', 'hooks', 'tiktok', 'youtube-shorts'],
    accentColor: '#ec4899',
    taskTypes: ['video', 'content'],
    prompt: `Sos especialista en videos cortos para redes, guiones de 15 a 30 segundos, escenas, hooks y llamados a la accion que generan engagement.`,
  },
  {
    id: 'design',
    name: 'Diseno',
    shortName: 'DSN',
    role: 'Diseno Visual',
    description: 'Piezas visuales, banners, carruseles y estetica de marca',
    capabilities: ['banners', 'carruseles', 'identidad', 'publicidad', 'producto'],
    accentColor: '#a78bfa',
    taskTypes: ['design', 'content'],
    prompt: `Sos especialista en piezas visuales, banners, carruseles, estetica de marca, imagenes de producto y creatividad publicitaria.`,
  },
  {
    id: 'meta-ads',
    name: 'Meta Ads',
    shortName: 'META',
    role: 'Publicidad Meta',
    description: 'Facebook, Instagram Ads y campanas de conversion',
    capabilities: ['facebook-ads', 'instagram-ads', 'audiencias', 'retargeting', 'ab-testing'],
    accentColor: '#3b82f6',
    taskTypes: ['ads', 'marketing'],
    prompt: `Sos especialista en campanas pagas en Meta (Facebook/Instagram), publicos, copies, pruebas A/B y optimizacion de conversion.`,
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    shortName: 'GADS',
    role: 'Publicidad Google',
    description: 'Search, Display y campanas de performance',
    capabilities: ['search-ads', 'display', 'remarketing', 'performance-max', 'shopping'],
    accentColor: '#ef4444',
    taskTypes: ['ads', 'marketing', 'seo'],
    prompt: `Sos especialista en Google Ads, campanas de busqueda, display, remarketing y performance max para maximizar ROAS.`,
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    shortName: 'MKP',
    role: 'Especialista Marketplace',
    description: 'Vendedores, productos y captacion de sellers',
    capabilities: ['sellers', 'productos', 'categorias', 'captacion', 'conversion'],
    accentColor: '#f97316',
    taskTypes: ['marketplace', 'sales', 'marketing'],
    prompt: `Sos especialista en marketplaces, vendedores, productos, publicaciones, categorias, captacion de sellers y conversion de listings.`,
  },
  {
    id: 'automation',
    name: 'Automatizacion',
    shortName: 'AUTO',
    role: 'Automatizacion y Flujos',
    description: 'n8n, emails, WhatsApp y flujos automaticos',
    capabilities: ['n8n', 'webhooks', 'email-automation', 'whatsapp', 'crm'],
    accentColor: '#10b981',
    taskTypes: ['automation', 'sales', 'marketing'],
    prompt: `Sos especialista en n8n, flujos automaticos, scraping legal, emails, WhatsApp, CRMs y automatizaciones de marketing.`,
  },
  {
    id: 'sales',
    name: 'Ventas',
    shortName: 'VNT',
    role: 'Agente Comercial',
    description: 'Captacion de clientes, leads y cierres comerciales',
    capabilities: ['leads', 'prospeccion', 'whatsapp-sales', 'email-ventas', 'cierre'],
    accentColor: '#84cc16',
    taskTypes: ['sales', 'marketing', 'marketplace'],
    prompt: `Sos especialista en captar clientes, vendedores, leads, mensajes de WhatsApp, emails comerciales y cierres de venta efectivos.`,
  },
  {
    id: 'analysis',
    name: 'Analisis',
    shortName: 'ANL',
    role: 'Analista de Datos',
    description: 'Metricas, reportes y diagnostico de rendimiento',
    capabilities: ['metricas', 'reportes', 'trafico', 'conversiones', 'diagnostico'],
    accentColor: '#64748b',
    taskTypes: ['analysis', 'seo', 'ads'],
    prompt: `Sos especialista en metricas, reportes, rendimiento, trafico, conversiones, prioridades y diagnostico de campanas.`,
  },
];

export const AGENT_MAP = new Map<AgentId, AgentConfig>(
  AGENTS.map((a) => [a.id, a])
);

export const PROJECTS = [
  { id: 'trabajocerca.site', name: 'TrabajaCerca', url: 'trabajocerca.site', type: 'marketplace' },
  { id: 'madsjeez.com.ar', name: 'Madsjeez AR', url: 'madsjeez.com.ar', type: 'brand' },
  { id: 'mellimelos.site', name: 'Mellimelos', url: 'mellimelos.site', type: 'ecommerce' },
  { id: 'bravura.site', name: 'Bravura', url: 'bravura.site', type: 'food' },
  { id: 'appjeezpro.com', name: 'AppJeezPro', url: 'appjeezpro.com', type: 'app' },
  { id: 'appjeezpro.store', name: 'AppJeezPro Store', url: 'appjeezpro.store', type: 'ecommerce' },
  { id: 'materianatural.site', name: 'Materia Natural', url: 'materianatural.site', type: 'wellness' },
  { id: 'madsjeezdesign.com', name: 'Madsjeez Design', url: 'madsjeezdesign.com', type: 'agency' },
  { id: 'madsjeez.com', name: 'Madsjeez', url: 'madsjeez.com', type: 'brand' },
];

export const PROJECT_MAP = new Map(PROJECTS.map((p) => [p.id, p]));

export const DEFAULT_AGENT_STATUSES: Record<AgentId, AgentStatus> = {
  ceo: 'online',
  marketing: 'online',
  seo: 'online',
  content: 'online',
  video: 'online',
  design: 'online',
  'meta-ads': 'online',
  'google-ads': 'online',
  marketplace: 'online',
  automation: 'online',
  sales: 'online',
  analysis: 'online',
};
