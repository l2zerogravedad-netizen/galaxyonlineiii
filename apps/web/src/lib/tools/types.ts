export type ToolName =
  | 'generate_script'
  | 'generate_video_prompt'
  | 'generate_campaign'
  | 'generate_social_post'
  | 'analyze_website'
  | 'generate_seo_plan';

export interface ToolResult<T = unknown> {
  ok: boolean;
  tool: ToolName;
  data?: T;
  error?: string;
  model?: string;
  provider?: string;
  latencyMs?: number;
}

// generate_script
export interface GenerateScriptInput {
  project: string;
  objective: string;
  duration: 15 | 20 | 30;
  platform: 'reels' | 'tiktok' | 'youtube' | 'historia' | 'general';
  tone?: string;
  videoType?: string;
}

export interface VideoScript {
  project: string;
  objective: string;
  duration: number;
  platform: string;
  hook: string;
  scenes: ScriptScene[];
  voiceover: string;
  subtitles: string;
  onScreenText: string[];
  cta: string;
  description: string;
  hashtags: string[];
  fileName: string;
}

export interface ScriptScene {
  scene: number;
  duration: string;
  visual: string;
  voiceover: string;
  text?: string;
}

// generate_video_prompt
export interface GenerateVideoPromptInput {
  project: string;
  script: VideoScript;
  visualStyle?: string;
}

export interface VideoPrompt {
  mptPrompt: string;
  voiceSuggested: string;
  musicSuggested: string;
  visualNotes: string;
}

// generate_campaign
export interface GenerateCampaignInput {
  project: string;
  objective: string;
  pieces: number;
  platforms: string[];
}

export interface Campaign {
  project: string;
  objective: string;
  totalPieces: number;
  ideas: CampaignPiece[];
  calendarSuggestion: string;
}

export interface CampaignPiece {
  type: 'video' | 'post' | 'story' | 'carousel';
  platform: string;
  title: string;
  hook: string;
  description: string;
  cta: string;
}

// analyze_website
export interface AnalyzeWebsiteInput {
  url: string;
}

export interface WebsiteAnalysis {
  url: string;
  summary: string;
  seoScore: number;
  uxIssues: string[];
  seoIssues: string[];
  improvements: string[];
  quickWins: string[];
}

// generate_seo_plan
export interface GenerateSEOPlanInput {
  project: string;
  focus?: string;
  quantity: number;
}

export interface SEOPlan {
  project: string;
  keywords: string[];
  articles: SEOArticle[];
  metaTitles: string[];
}

export interface SEOArticle {
  title: string;
  slug: string;
  keyword: string;
  description: string;
  headings: string[];
}
