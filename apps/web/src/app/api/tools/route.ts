import { NextRequest } from 'next/server';
import { routedCall, detectDomain } from '@/lib/ai/model-router';
import { getProjectContext, getProject } from '@/lib/projects/config';
import type {
  ToolName, ToolResult,
  GenerateScriptInput, VideoScript,
  GenerateVideoPromptInput, VideoPrompt,
  GenerateCampaignInput, Campaign,
  AnalyzeWebsiteInput, WebsiteAnalysis,
  GenerateSEOPlanInput, SEOPlan,
} from '@/lib/tools/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function systemMsg(content: string) { return { role: 'system', content }; }
function userMsg(content: string) { return { role: 'user', content }; }

// ─── Tool: generate_script ────────────────────────────────────────────────────

async function generateScript(input: GenerateScriptInput): Promise<ToolResult<VideoScript>> {
  const t0 = Date.now();
  const proj = getProject(input.project);
  const ctx = getProjectContext(input.project);
  const rules = proj?.contentRules?.join('\n- ') ?? '';
  const videoType = input.videoType ?? 'comercial directo';

  const system = `Sos un experto en guiones de video para redes sociales argentinas. Creás guiones de ${input.duration} segundos para ${input.platform}.
${ctx}

REGLAS OBLIGATORIAS:
- ${rules}
- No repetir siempre el mismo gancho
- Cada escena dura máximo 5 segundos
- Formato 9:16 vertical
- Lenguaje argentino natural (vos, te, tu)
- Incluir gancho FUERTE en los primeros 3 segundos`;

  const prompt = `Creá un guion de video de ${input.duration} segundos para ${input.project}.
OBJETIVO: ${input.objective}
TIPO: ${videoType}
PLATAFORMA: ${input.platform}
TONO: ${input.tone ?? proj?.tone ?? 'dinámico y directo'}

Respondé SOLO en JSON válido con esta estructura exacta:
{
  "hook": "gancho de apertura (primeros 3 seg)",
  "scenes": [
    {"scene": 1, "duration": "0-5seg", "visual": "descripción de lo que se ve", "voiceover": "texto hablado", "text": "texto en pantalla"},
    ...
  ],
  "voiceover": "guion completo de voz en off",
  "subtitles": "subtítulos completos del video",
  "onScreenText": ["texto 1", "texto 2", "texto 3"],
  "cta": "llamado a la acción final",
  "description": "descripción para publicar en redes",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "fileName": "video_${input.project.replace(/\./g, '_')}_${Date.now()}"
}`;

  try {
    const result = await routedCall(
      [systemMsg(system), userMsg(prompt)],
      { domain: 'video', temperature: 0.8, maxTokens: 1500 },
    );

    let parsed: Partial<VideoScript>;
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) as Partial<VideoScript> : {};
    } catch {
      // Return as structured text if JSON fails
      parsed = {
        hook: result.content.split('\n')[0] ?? 'Gancho',
        voiceover: result.content,
        scenes: [],
        subtitles: '',
        onScreenText: [],
        cta: proj?.cta?.[0] ?? '',
        description: input.objective,
        hashtags: proj?.hashtags?.slice(0, 8) ?? [],
        fileName: `video_${input.project.replace(/\./g, '_')}_${Date.now()}`,
      };
    }

    return {
      ok: true,
      tool: 'generate_script',
      data: {
        project: input.project,
        objective: input.objective,
        duration: input.duration,
        platform: input.platform,
        ...parsed,
      } as VideoScript,
      model: result.model,
      provider: result.provider,
      latencyMs: Date.now() - t0,
    };
  } catch (e) {
    return { ok: false, tool: 'generate_script', error: (e as Error).message };
  }
}

// ─── Tool: generate_video_prompt ──────────────────────────────────────────────

async function generateVideoPrompt(input: GenerateVideoPromptInput): Promise<ToolResult<VideoPrompt>> {
  const t0 = Date.now();
  const proj = getProject(input.project);

  const system = `Sos un especialista en prompts para MoneyPrinterTurbo (MPT). Creás prompts optimizados para generar videos con IA.`;
  const prompt = `Basándote en este guion, creá los parámetros para MoneyPrinterTurbo:

PROYECTO: ${input.project}
GUION: ${input.script.voiceover}
GANCHO: ${input.script.hook}
CTA: ${input.script.cta}
ESTILO VISUAL: ${input.visualStyle ?? proj?.tone ?? 'moderno y dinámico'}

Respondé en JSON:
{
  "mptPrompt": "prompt detallado para el video en inglés (describe cada escena visualmente)",
  "voiceSuggested": "voz sugerida (ej: es-AR-ElenaNeural)",
  "musicSuggested": "tipo de música de fondo",
  "visualNotes": "notas adicionales para el estilo visual"
}`;

  try {
    const result = await routedCall(
      [systemMsg(system), userMsg(prompt)],
      { domain: 'video', temperature: 0.7, maxTokens: 600 },
    );
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) as VideoPrompt : { mptPrompt: result.content, voiceSuggested: 'es-AR-ElenaNeural', musicSuggested: 'upbeat electronic', visualNotes: '' };

    return { ok: true, tool: 'generate_video_prompt', data, model: result.model, provider: result.provider, latencyMs: Date.now() - t0 };
  } catch (e) {
    return { ok: false, tool: 'generate_video_prompt', error: (e as Error).message };
  }
}

// ─── Tool: generate_campaign ──────────────────────────────────────────────────

async function generateCampaign(input: GenerateCampaignInput): Promise<ToolResult<Campaign>> {
  const t0 = Date.now();
  const ctx = getProjectContext(input.project);

  const system = `Sos un estratega de marketing digital especialista en campañas para Argentina.
${ctx}`;

  const prompt = `Creá una campaña completa de ${input.pieces} piezas para ${input.project}.
OBJETIVO: ${input.objective}
PLATAFORMAS: ${input.platforms.join(', ')}

Respondé en JSON:
{
  "totalPieces": ${input.pieces},
  "ideas": [
    {"type": "video|post|story|carousel", "platform": "...", "title": "...", "hook": "...", "description": "...", "cta": "..."}
  ],
  "calendarSuggestion": "sugerencia de calendario semanal"
}`;

  try {
    const result = await routedCall(
      [systemMsg(system), userMsg(prompt)],
      { domain: 'marketing', temperature: 0.8, maxTokens: 2000 },
    );
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) as Omit<Campaign, 'project' | 'objective'> : { totalPieces: 0, ideas: [], calendarSuggestion: result.content };

    return {
      ok: true, tool: 'generate_campaign',
      data: { project: input.project, objective: input.objective, ...data },
      model: result.model, provider: result.provider, latencyMs: Date.now() - t0,
    };
  } catch (e) {
    return { ok: false, tool: 'generate_campaign', error: (e as Error).message };
  }
}

// ─── Tool: analyze_website ────────────────────────────────────────────────────

async function analyzeWebsite(input: AnalyzeWebsiteInput): Promise<ToolResult<WebsiteAnalysis>> {
  const t0 = Date.now();

  const system = `Sos un experto en SEO, UX y conversión web. Analizás sitios web argentinos.`;
  const prompt = `Analizá el sitio web: ${input.url}

Basándote en lo que conocés de esta URL y su nicho, respondé en JSON:
{
  "summary": "resumen de qué es el sitio y su propósito",
  "seoScore": 65,
  "uxIssues": ["problema UX 1", "problema UX 2"],
  "seoIssues": ["problema SEO 1", "problema SEO 2"],
  "improvements": ["mejora prioritaria 1", "mejora 2", "mejora 3"],
  "quickWins": ["acción rápida 1", "acción rápida 2"]
}`;

  try {
    const result = await routedCall(
      [systemMsg(system), userMsg(prompt)],
      { domain: 'seo', temperature: 0.5, maxTokens: 800 },
    );
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    const data = jsonMatch
      ? JSON.parse(jsonMatch[0]) as Omit<WebsiteAnalysis, 'url'>
      : { summary: result.content, seoScore: 0, uxIssues: [], seoIssues: [], improvements: [], quickWins: [] };

    return { ok: true, tool: 'analyze_website', data: { url: input.url, ...data }, model: result.model, provider: result.provider, latencyMs: Date.now() - t0 };
  } catch (e) {
    return { ok: false, tool: 'analyze_website', error: (e as Error).message };
  }
}

// ─── Tool: generate_seo_plan ──────────────────────────────────────────────────

async function generateSEOPlan(input: GenerateSEOPlanInput): Promise<ToolResult<SEOPlan>> {
  const t0 = Date.now();
  const ctx = getProjectContext(input.project);

  const system = `Sos un experto SEO para Argentina. Creás planes de contenido basados en keywords reales.
${ctx}`;

  const prompt = `Creá un plan SEO de ${input.quantity} artículos para ${input.project}.
FOCO: ${input.focus ?? 'general'}

Respondé en JSON:
{
  "keywords": ["keyword 1", "keyword 2", ...],
  "articles": [
    {
      "title": "título SEO optimizado",
      "slug": "slug-url-amigable",
      "keyword": "keyword principal",
      "description": "meta description 155 chars",
      "headings": ["H2 uno", "H2 dos", "H2 tres"]
    }
  ],
  "metaTitles": ["título meta 1", "título meta 2"]
}`;

  try {
    const result = await routedCall(
      [systemMsg(system), userMsg(prompt)],
      { domain: 'seo', temperature: 0.6, maxTokens: 2000 },
    );
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    const data = jsonMatch
      ? JSON.parse(jsonMatch[0]) as Omit<SEOPlan, 'project'>
      : { keywords: [], articles: [], metaTitles: [] };

    return { ok: true, tool: 'generate_seo_plan', data: { project: input.project, ...data }, model: result.model, provider: result.provider, latencyMs: Date.now() - t0 };
  } catch (e) {
    return { ok: false, tool: 'generate_seo_plan', error: (e as Error).message };
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

const TOOL_MAP: Record<ToolName, (input: unknown) => Promise<ToolResult>> = {
  generate_script:       (i) => generateScript(i as GenerateScriptInput),
  generate_video_prompt: (i) => generateVideoPrompt(i as GenerateVideoPromptInput),
  generate_campaign:     (i) => generateCampaign(i as GenerateCampaignInput),
  generate_social_post:  async () => ({ ok: false, tool: 'generate_social_post' as ToolName, error: 'Use generate_campaign con pieces=1' }),
  analyze_website:       (i) => analyzeWebsite(i as AnalyzeWebsiteInput),
  generate_seo_plan:     (i) => generateSEOPlan(i as GenerateSEOPlanInput),
};

export async function POST(req: NextRequest) {
  const { tool, input } = await req.json() as { tool: ToolName; input: unknown };
  if (!tool || !TOOL_MAP[tool]) {
    return Response.json({ ok: false, error: `Tool desconocido: ${tool}` }, { status: 400 });
  }
  const result = await TOOL_MAP[tool](input);
  return Response.json(result, { status: result.ok ? 200 : 500 });
}

export async function GET() {
  return Response.json({
    tools: Object.keys(TOOL_MAP),
    description: 'POST { tool, input } para ejecutar una herramienta',
  });
}
