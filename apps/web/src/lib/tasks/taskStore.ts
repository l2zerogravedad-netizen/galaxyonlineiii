import { create } from 'zustand';
import { AgentId, AgentStatus, Message, Task, TaskStatus } from './taskTypes';
import { DEFAULT_AGENT_STATUSES } from '../agents/agents';
import { generateAgentOutput, generateSimulatedResponse, sendMessageToAgent, sendMessageToCEO } from '../agents/aiProvider';
import { detectSlashCommand, parseOrder } from './taskParser';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

type ParsedOrder = ReturnType<typeof parseOrder>;

export interface CommandCenterState {
  activeAgentId: AgentId;
  conversations: Record<AgentId, Message[]>;
  isThinking: boolean;
  tasks: Task[];
  approvalMode: boolean;
  pendingPlan: { parsed: ParsedOrder; userMessage: string } | null;
  selectedProject: string;
  agentStatuses: Record<AgentId, AgentStatus>;
  setActiveAgent: (id: AgentId) => void;
  setSelectedProject: (project: string) => void;
  toggleApprovalMode: () => void;
  sendMessage: (content: string) => Promise<void>;
  approveAndExecute: () => Promise<void>;
  cancelApproval: () => void;
  addMessage: (agentId: AgentId, msg: Message) => void;
}

export const useCommandCenter = create<CommandCenterState>((set, get) => ({
  activeAgentId: 'ceo',
  conversations: {} as Record<AgentId, Message[]>,
  isThinking: false,
  tasks: [],
  approvalMode: false,
  pendingPlan: null,
  selectedProject: 'trabajocerca.site',
  agentStatuses: { ...DEFAULT_AGENT_STATUSES },

  setActiveAgent: (id) => set({ activeAgentId: id }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  toggleApprovalMode: () => set((s) => ({ approvalMode: !s.approvalMode })),

  addMessage: (agentId, msg) =>
    set((s) => ({
      conversations: {
        ...s.conversations,
        [agentId]: [...(s.conversations[agentId] ?? []), msg],
      },
    })),

  sendMessage: async (content: string) => {
    const state = get();
    const { activeAgentId, selectedProject, approvalMode } = state;
    const slashCmd = detectSlashCommand(content);

    const userMsg: Message = {
      id: uid(),
      role: 'user',
      content,
      agentId: activeAgentId,
      timestamp: Date.now(),
    };
    state.addMessage(activeAgentId, userMsg);

    if (slashCmd) {
      await handleSlashCommand(slashCmd, content, get, set);
      return;
    }

    set({ isThinking: true });

    const thinkingMsg: Message = {
      id: uid(),
      role: 'assistant',
      content: '',
      agentId: activeAgentId,
      timestamp: Date.now(),
      isThinking: true,
    };
    state.addMessage(activeAgentId, thinkingMsg);
    setAgentStatus(set, activeAgentId, 'working');

    await delay(600 + Math.random() * 400);

    set((s) => ({
      conversations: {
        ...s.conversations,
        [activeAgentId]: (s.conversations[activeAgentId] ?? []).filter((m) => !m.isThinking),
      },
    }));

    if (activeAgentId === 'ceo') {
      const parsed = parseOrder(content, selectedProject);

      if (approvalMode) {
        set({ pendingPlan: { parsed, userMessage: content }, isThinking: false });
        setAgentStatus(set, 'ceo', 'online');

        get().addMessage('ceo', {
          id: uid(),
          role: 'assistant',
          content: `**[MODO APROBACION ACTIVO]**\n\nRevisa el plan antes de ejecutar:\n\n**Proyecto:** ${parsed.project}\n**Tipo:** ${parsed.type}\n**Tareas a crear:** ${parsed.tasks.length}\n**Agentes:** ${parsed.assignedAgents.join(', ')}\n\nAprueba o cancela desde el modal.`,
          agentId: 'ceo',
          timestamp: Date.now(),
        });
        return;
      }

      const ceoResponse = await sendMessageToCEO(content, get().conversations['ceo'] ?? [], parsed);
      get().addMessage('ceo', {
        id: uid(),
        role: 'assistant',
        content: ceoResponse,
        agentId: 'ceo',
        timestamp: Date.now(),
      });

      set({ isThinking: false });
      setAgentStatus(set, 'ceo', 'online');
      executeTaskPlan(parsed, set, get);
    } else {
      const history = get().conversations[activeAgentId] ?? [];
      const response = await sendMessageToAgent(content, activeAgentId, history);
      get().addMessage(activeAgentId, {
        id: uid(),
        role: 'assistant',
        content: response,
        agentId: activeAgentId,
        timestamp: Date.now(),
      });
      set({ isThinking: false });
      setAgentStatus(set, activeAgentId, 'online');
    }
  },

  approveAndExecute: async () => {
    const { pendingPlan } = get();
    if (!pendingPlan) return;
    const { parsed, userMessage } = pendingPlan;
    set({ pendingPlan: null });

    const ceoResponse = await sendMessageToCEO(userMessage, get().conversations['ceo'] ?? [], parsed);
    get().addMessage('ceo', {
      id: uid(),
      role: 'assistant',
      content: ceoResponse,
      agentId: 'ceo',
      timestamp: Date.now(),
    });

    executeTaskPlan(parsed, set, get);
  },

  cancelApproval: () => {
    get().addMessage('ceo', {
      id: uid(),
      role: 'assistant',
      content: 'Plan cancelado. Avisame cuando quieras reintentar o ajustar la orden.',
      agentId: 'ceo',
      timestamp: Date.now(),
    });
    set({ pendingPlan: null });
  },
}));

type StoreSet = (
  partial:
    | Partial<CommandCenterState>
    | ((state: CommandCenterState) => Partial<CommandCenterState>)
) => void;
type StoreGet = () => CommandCenterState;

function setAgentStatus(set: StoreSet, agentId: AgentId, status: AgentStatus) {
  set((s) => ({ agentStatuses: { ...s.agentStatuses, [agentId]: status } }));
}

function updateTaskStatus(set: StoreSet, taskId: string, status: TaskStatus, output?: string) {
  set((s) => ({
    tasks: s.tasks.map((t: Task) =>
      t.id === taskId ? { ...t, status, updatedAt: Date.now(), ...(output ? { output } : {}) } : t
    ),
  }));
}

function executeTaskPlan(parsed: ParsedOrder, set: StoreSet, get: StoreGet) {
  const now = Date.now();
  const newTasks: Task[] = parsed.tasks.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    project: parsed.project,
    type: def.type,
    quantity: parsed.quantity,
    objective: parsed.objective,
    assignedAgents: def.agents as AgentId[],
    priority: parsed.priority,
    status: 'pending' as TaskStatus,
    createdAt: now,
    updatedAt: now,
  }));

  set((s) => ({ tasks: [...s.tasks, ...newTasks] }));

  newTasks.forEach((task, i) => {
    setTimeout(() => {
      simulateTaskProgress(task, set, get);
    }, i * 500);
  });
}

async function simulateTaskProgress(task: Task, set: StoreSet, get: StoreGet) {
  const mainAgent: AgentId = task.assignedAgents[0] ?? 'ceo';

  await delay(1000 + Math.random() * 1500);
  updateTaskStatus(set, task.id, 'analyzing');
  setAgentStatus(set, mainAgent, 'working');

  const analysisMsg = generateSimulatedResponse(mainAgent, task.title);
  get().addMessage(mainAgent, {
    id: uid(),
    role: 'assistant',
    content: `[${task.title}]\n\n${analysisMsg}`,
    agentId: mainAgent,
    timestamp: Date.now(),
  });

  await delay(3000 + Math.random() * 3000);
  updateTaskStatus(set, task.id, 'working');

  await delay(8000 + Math.random() * 14000);

  const output = generateAgentOutput(mainAgent, task);
  updateTaskStatus(set, task.id, 'completed', output);
  setAgentStatus(set, mainAgent, 'online');

  get().addMessage(mainAgent, {
    id: uid(),
    role: 'assistant',
    content: `[Completado: ${task.title}]\n\n${output}`,
    agentId: mainAgent,
    timestamp: Date.now(),
  });
}

async function handleSlashCommand(
  cmd: string,
  fullMessage: string,
  get: StoreGet,
  set: StoreSet
) {
  const { activeAgentId, tasks, selectedProject, agentStatuses } = get();
  const respond = (content: string) =>
    get().addMessage(activeAgentId, {
      id: uid(),
      role: 'assistant',
      content,
      agentId: activeAgentId,
      timestamp: Date.now(),
    });

  set({ isThinking: false });

  switch (cmd) {
    case '/ceo':
      set({ activeAgentId: 'ceo' });
      respond('Conectado con CEO IA. Cual es la orden?');
      break;

    case '/estado': {
      const active = tasks.filter((t) => ['analyzing', 'working'].includes(t.status)).length;
      const done = tasks.filter((t) => t.status === 'completed').length;
      const pending = tasks.filter((t) => t.status === 'pending').length;
      const errored = tasks.filter((t) => t.status === 'error').length;
      respond(`**Estado de tareas:**\n- Activas: ${active}\n- Completadas: ${done}\n- Pendientes: ${pending}\n- Errores: ${errored}\n- Total: ${tasks.length}`);
      break;
    }

    case '/proyectos': {
      const { PROJECTS } = await import('../agents/agents');
      respond(`**Proyectos disponibles:**\n${PROJECTS.map((p) => `- ${p.name} (${p.url})`).join('\n')}`);
      break;
    }

    case '/reporte': {
      const done = tasks.filter((t) => t.status === 'completed').length;
      const active = tasks.filter((t) => ['analyzing', 'working'].includes(t.status)).length;
      const byProject: Record<string, number> = {};
      for (const t of tasks) byProject[t.project] = (byProject[t.project] ?? 0) + 1;
      const lines = Object.entries(byProject).map(([p, n]) => `  - ${p}: ${n}`).join('\n');
      respond(`**Reporte de actividad:**\n\n- Completadas: ${done}\n- En progreso: ${active}\n- Total: ${tasks.length}\n\nPor proyecto:\n${lines || '  Sin tareas aun.'}`);
      break;
    }

    case '/agentes': {
      const { AGENTS } = await import('../agents/agents');
      respond(`**Agentes disponibles:**\n${AGENTS.map((a) => `- ${a.name} (${a.role}) [${agentStatuses[a.id] ?? 'online'}]`).join('\n')}`);
      break;
    }

    case '/video':
    case '/seo':
    case '/contenido':
    case '/ads':
    case '/ventas':
    case '/campaña':
    case '/campana': {
      const type = cmd.replace('/', '');
      respond(`Listo para una tarea de ${type}. Describe que necesitas para ${selectedProject}. Ejemplo: "5 ${type === 'video' ? 'reels' : type} para ${selectedProject}"`);
      break;
    }

    default:
      respond(`Comando no reconocido: ${cmd}. Escribe /agentes para ver la lista de agentes.`);
  }
}
