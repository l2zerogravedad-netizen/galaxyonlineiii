import { AgentId, Message, ParsedOrder, Task } from '../tasks/taskTypes';
import { AGENT_MAP, PROJECTS } from './agents';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callAIRoute(messages: AIMessage[]): Promise<string | null> {
  try {
    const res = await fetch('/api/command-center/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.content ?? null;
  } catch {
    return null;
  }
}

function buildHistory(messages: Message[]): AIMessage[] {
  return messages.slice(-8).map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.content,
  }));
}

export async function sendMessageToAgent(
  userMessage: string,
  agentId: AgentId,
  history: Message[]
): Promise<string> {
  const agent = AGENT_MAP.get(agentId);
  if (!agent) return 'Agente no encontrado.';

  const messages: AIMessage[] = [
    { role: 'system', content: agent.prompt },
    ...buildHistory(history),
    { role: 'user', content: userMessage },
  ];

  const aiResponse = await callAIRoute(messages);
  if (aiResponse) return aiResponse;

  return generateSimulatedResponse(agentId, userMessage);
}

export async function sendMessageToCEO(
  userMessage: string,
  history: Message[],
  parsed: ParsedOrder
): Promise<string> {
  const ceo = AGENT_MAP.get('ceo')!;

  const messages: AIMessage[] = [
    { role: 'system', content: ceo.prompt },
    ...buildHistory(history),
    { role: 'user', content: userMessage },
  ];

  const aiResponse = await callAIRoute(messages);
  if (aiResponse) return aiResponse;

  return generateCEOResponse(parsed);
}

function generateCEOResponse(parsed: ParsedOrder): string {
  const { project, type, quantity, objective, assignedAgents, priority, tasks } = parsed;
  const projectName = PROJECTS.find((p) => p.id === project)?.name ?? project;
  const agentNames = assignedAgents
    .map((id) => AGENT_MAP.get(id)?.name)
    .filter(Boolean)
    .join(', ');
  const typeLabels: Record<string, string> = {
    video: 'Videos / Reels',
    content: 'Contenido',
    seo: 'SEO y Contenido',
    design: 'Diseno',
    ads: 'Publicidad Paga',
    marketplace: 'Marketplace',
    automation: 'Automatizacion',
    sales: 'Ventas',
    analysis: 'Analisis',
    marketing: 'Campana de Marketing',
    general: 'Tarea General',
  };
  const priorityLabels: Record<string, string> = {
    urgent: 'Urgente',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  };

  const taskList = tasks
    .map((t, i) => `${i + 1}. ${t.title}`)
    .join('\n');

  return `Entendido. Voy a organizar esta orden.

**Proyecto:** ${projectName} (${project})
**Tipo de trabajo:** ${typeLabels[type] ?? type}
${quantity ? `**Cantidad:** ${quantity} unidades\n` : ''}**Objetivo:** ${objective}
**Agentes asignados:** ${agentNames}
**Tareas creadas:** ${tasks.length}
**Prioridad:** ${priorityLabels[priority] ?? priority}

**Plan de accion:**
${taskList}

**Proximo paso:** Los agentes van a comenzar en los proximos segundos. Podras ver el progreso en el panel de tareas de la derecha.`;
}

export function generateAgentOutput(agentId: AgentId, task: Task): string {
  const outputs: Record<AgentId, (t: Task) => string> = {
    ceo: (t) =>
      `Tarea coordinada exitosamente. El equipo ejecuto "${t.title}" para ${t.project} con prioridad ${t.priority}.`,
    video: (t) =>
      `Videos listos para ${t.project}.\n\nEstructura producida:\n- Hook emocional (0-3s)\n- Problema + solucion (3-15s)\n- Evidencia visual (15-25s)\n- CTA clara (25-30s)\n\nTono: dinamico, autentico, argentino.\nVoz sugerida: es-AR-ElenaNeural o TomasNeural.`,
    content: (t) =>
      `Contenido generado para ${t.project}.\n\nPiezas listas:\n- Textos optimizados para conversion\n- Estructura con hook, desarrollo y CTA\n- Adaptados a tono de marca\n\nObjeto: ${t.objective}`,
    seo: (t) =>
      `SEO analizado para ${t.project}.\n\nHallazgos principales:\n- Keywords de alto potencial identificadas\n- Estructura de URL revisada\n- Meta titles y descriptions optimizados\n- Oportunidades de link building detectadas`,
    design: (t) =>
      `Piezas disenadas para ${t.project}.\n\nEntregables:\n- Banners en formatos 1:1, 4:5 y 9:16\n- Paleta de marca aplicada\n- Tipografia consistente\n- Variantes A/B preparadas`,
    'meta-ads': (t) =>
      `Campana Meta Ads configurada para ${t.project}.\n\nEstructura:\n- Campana: Conversion - ${t.project}\n- Conjunto de anuncios: Publico caliente + frio\n- Anuncios: 3 copies x 2 imagenes\n- Budget sugerido: $15-30 USD/dia`,
    'google-ads': (t) =>
      `Campana Google Ads lista para ${t.project}.\n\nEstructura:\n- Busqueda: keywords exactas + amplia modificada\n- Remarketing: visitantes de los ultimos 30 dias\n- Extensiones: sitelinks, llamadas, ubicacion\n- CPA objetivo configurado`,
    marketplace: (t) =>
      `Estrategia marketplace ejecutada para ${t.project}.\n\nAcciones:\n- Fichas de productos optimizadas\n- Categorias revisadas y corregidas\n- Palabras clave en titulos actualizadas\n- Fotos y descripciones mejoradas`,
    automation: (t) =>
      `Automatizacion configurada para ${t.project}.\n\nFlujos creados:\n- Bienvenida a nuevos usuarios\n- Follow-up de leads frios\n- Notificaciones WhatsApp configuradas\n- Reportes diarios automatizados`,
    sales: (t) =>
      `Estrategia comercial lista para ${t.project}.\n\nAcciones:\n- Guion de WhatsApp optimizado\n- Email de seguimiento redactado\n- Objeciones principales respondidas\n- Pipeline de ventas estructurado`,
    analysis: (t) =>
      `Analisis completado para ${t.project}.\n\nResultados:\n- Trafico analizado: ultimos 30 dias\n- Conversion rate identificada\n- Puntos de fuga detectados\n- Recomendaciones priorizadas por impacto`,
    marketing: (t) =>
      `Campana de marketing disenada para ${t.project}.\n\nEstrategia:\n- Segmento objetivo definido\n- Canales seleccionados: organico + pago\n- Mensajes clave elaborados\n- Calendar de contenido armado`,
  };

  const fn = outputs[agentId];
  return fn ? fn(task) : `Tarea "${task.title}" completada para ${task.project}.`;
}

export function generateSimulatedResponse(agentId: AgentId, _userMessage: string): string {
  const responses: Record<AgentId, string[]> = {
    ceo: [
      'Recibido. Voy a revisar el panorama de todos los proyectos y te doy un plan de accion en un momento.',
      'Entendido. Coordinando los equipos para ejecutar esto de forma eficiente.',
    ],
    video: [
      'Perfecto. Analizo el brief y arranco con los guiones. Te mando las estructuras listas en unos minutos.',
      'Recibido. Empiezo con los hooks y armamos el formato para redes.',
    ],
    seo: [
      'Arrancando el analisis de keywords. Voy a ver que oportunidades hay en el nicho y te traigo los datos.',
      'Revisando la arquitectura SEO actual. En unos minutos tengo el diagnostico.',
    ],
    content: [
      'Entendido. Arranco con los textos. Los optimizo para conversion y tono de marca.',
      'Recibido. Voy a estructurar el contenido con hook, desarrollo y CTA claros.',
    ],
    design: [
      'Listo. Arranco con las piezas. Las adapto a todos los formatos necesarios.',
      'Perfecto. Disenan con la paleta de marca y te mando las variantes.',
    ],
    'meta-ads': [
      'Configurando la campana. Armo los conjuntos de anuncios y los copies.',
      'Recibido. Voy a segmentar el publico y preparar los anuncios.',
    ],
    'google-ads': [
      'Analizando keywords para la campana. Armo la estructura de busqueda.',
      'Perfecto. Configuro el remarketing y la campana de busqueda.',
    ],
    marketplace: [
      'Revisando las fichas de productos. Optimizo titulos y descripciones.',
      'Arrancando con las publicaciones del marketplace. Mejoro el SEO de listings.',
    ],
    automation: [
      'Disenando el flujo. Lo integro con WhatsApp y email.',
      'Perfecto. Armo el workflow en n8n y te lo dejo listo para activar.',
    ],
    sales: [
      'Arrancando con la estrategia comercial. Preparo el guion y los mensajes.',
      'Recibido. Optimizo el embudo de ventas y los mensajes de seguimiento.',
    ],
    analysis: [
      'Analizando los datos. Dame un momento para revisar las metricas y traerte el diagnostico.',
      'Perfecto. Voy a minar los numeros y te traigo las recomendaciones priorizadas.',
    ],
    marketing: [
      'Disenando la estrategia de campana. Te traigo el plan completo.',
      'Recibido. Armo el plan de marketing con canales, mensajes y timeline.',
    ],
  };

  const opts = responses[agentId] ?? ['Recibido. Trabajando en ello.'];
  return opts[Math.floor(Math.random() * opts.length)];
}
