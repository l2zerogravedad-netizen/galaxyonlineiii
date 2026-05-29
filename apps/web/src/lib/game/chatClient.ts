import axios from 'axios';
import '@/lib/apiBase';

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

/**
 * Fetch recent chat messages from the backend.
 * @param limit Maximum number of messages to retrieve (default: 50)
 */
export async function getMessages(limit = 50): Promise<ChatMessage[] | null> {
  try {
    const { data } = await axios.get<ChatMessage[]>('/api/chat', {
      params: { limit },
      headers: authHeaders(),
    });
    return data ?? null;
  } catch (e) {
    console.warn('[chatClient] getMessages failed:', e);
    return null;
  }
}

/**
 * Send a new chat message to the backend.
 * @param message The message text to send
 */
export async function sendMessage(message: string): Promise<void> {
  await axios.post(
    '/api/chat',
    { message },
    { headers: authHeaders() }
  );
}
