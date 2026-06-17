export type TaskStatus =
  | 'pending'
  | 'analyzing'
  | 'working'
  | 'awaiting_approval'
  | 'completed'
  | 'error';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskType =
  | 'video'
  | 'content'
  | 'seo'
  | 'design'
  | 'ads'
  | 'marketplace'
  | 'automation'
  | 'sales'
  | 'analysis'
  | 'marketing'
  | 'general';

export type AgentId =
  | 'ceo'
  | 'marketing'
  | 'seo'
  | 'content'
  | 'video'
  | 'design'
  | 'meta-ads'
  | 'google-ads'
  | 'marketplace'
  | 'automation'
  | 'sales'
  | 'analysis';

export type AgentStatus = 'online' | 'working' | 'idle' | 'error';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentId: AgentId;
  timestamp: number;
  isThinking?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  type: TaskType;
  quantity?: number;
  objective: string;
  assignedAgents: AgentId[];
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  output?: string;
  error?: string;
  parentTaskId?: string;
}

export interface ParsedOrder {
  project: string;
  type: TaskType;
  quantity?: number;
  objective: string;
  assignedAgents: AgentId[];
  priority: TaskPriority;
  tasks: SubtaskDefinition[];
}

export interface SubtaskDefinition {
  id: string;
  title: string;
  type: TaskType;
  agents: AgentId[];
  description: string;
}

export interface SlashCommand {
  command: string;
  label: string;
  description: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  { command: '/ceo', label: '/ceo', description: 'Hablar con el CEO' },
  { command: '/agentes', label: '/agentes', description: 'Ver todos los agentes' },
  { command: '/tarea', label: '/tarea', description: 'Crear tarea manual' },
  { command: '/estado', label: '/estado', description: 'Estado de tareas' },
  { command: '/proyectos', label: '/proyectos', description: 'Proyectos disponibles' },
  { command: '/reporte', label: '/reporte', description: 'Generar reporte' },
  { command: '/campaña', label: '/campaña', description: 'Crear campaña' },
  { command: '/seo', label: '/seo', description: 'Tarea SEO' },
  { command: '/video', label: '/video', description: 'Tarea de video' },
  { command: '/contenido', label: '/contenido', description: 'Tarea de contenido' },
  { command: '/ads', label: '/ads', description: 'Tarea de publicidad' },
  { command: '/ventas', label: '/ventas', description: 'Tarea comercial' },
];
