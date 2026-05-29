'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getMessages, sendMessage, type ChatMessageData } from '@/lib/game/chatClient';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type MessageType = 'system' | 'alliance' | 'global';

interface ChatMessage {
  id: string;
  sender: string;
  tag: string;
  text: string;
  color: string;
  type: MessageType;
}

/* ------------------------------------------------------------------ */
/*  Initial mock messages (exact GO2 format) — fallback               */
/* ------------------------------------------------------------------ */

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'System', tag: '[INF]', text: '\u2605\u2640\u2666 Peralta: d', color: '#90a4ae', type: 'system' },
  { id: '2', sender: 'System', tag: '[INF]', text: '\u2605\u2640\u2666 Peralta: sa', color: '#90a4ae', type: 'system' },
  { id: '3', sender: 'System', tag: '[INF]', text: '\u2666\u2666 Peralta: sa', color: '#90a4ae', type: 'system' },
  { id: '4', sender: 'System', tag: '[INF]', text: '\u2666\u2666 Peralta: se', color: '#90a4ae', type: 'system' },
  { id: '5', sender: 'System', tag: '[INF]', text: '\u2666\u2666 Peralta: as', color: '#90a4ae', type: 'system' },
  { id: '6', sender: 'System', tag: '[INF]', text: '\u2666\u2666 Peralta: d', color: '#90a4ae', type: 'system' },
  { id: '7', sender: 'Destiny', tag: '[Destiny]', text: 'Arcang: Necesito refuerzos en el sector 7', color: '#64b5f6', type: 'alliance' },
  { id: '8', sender: 'Salvation', tag: '[Salvation]', text: 'Ginjaa: Flota en camino', color: '#81c784', type: 'alliance' },
  { id: '9', sender: 'INFerno', tag: '[=INFERN=]', text: 'OnlyDisaster: Guerra en 30 min', color: '#e57373', type: 'alliance' },
  { id: '10', sender: 'Destiny', tag: '[Destiny]', text: 'zakio: Comercio abierto', color: '#64b5f6', type: 'alliance' },
  { id: '11', sender: 'CONFEDERATION', tag: '[CONFEDERATION]', text: 'GodSlayer: Alianza reuni\u00F3n 22:00', color: '#ffd54f', type: 'alliance' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Convert API message to local format */
function apiMessageToLocal(msg: ChatMessageData): ChatMessage {
  return {
    id: msg.id || Date.now().toString(),
    sender: msg.sender || 'Unknown',
    tag: msg.tag || '[SYS]',
    text: msg.text || '',
    color: msg.color || '#90a4ae',
    type: (msg.type as MessageType) || 'system',
  };
}

/** Alliance color lookup for player-sent messages */
function getSenderColor(sender: string): string {
  const colors: Record<string, string> = {
    'Destiny': '#64b5f6',
    'Salvation': '#81c784',
    'INFerno': '#e57373',
    'CONFEDERATION': '#ffd54f',
    'System': '#90a4ae',
  };
  return colors[sender] || '#4fc3f7';
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Go2GalaxyChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [usingBackend, setUsingBackend] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  /* Auto-scroll to bottom on new messages */
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  /* Load messages from API */
  const loadMessages = useCallback(async () => {
    try {
      const data = await getMessages(50);
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map(apiMessageToLocal);
        setMessages((prev) => {
          // Merge: keep local messages that aren't from API, add API messages
          const apiIds = new Set(mapped.map((m) => m.id));
          const localOnly = prev.filter((p) => p.sender === 'Player' && !apiIds.has(p.id));
          return [...mapped, ...localOnly];
        });
        setUsingBackend(true);
        setApiError(null);
      }
    } catch (err) {
      // Silently fail — keep local messages as fallback
      setUsingBackend(false);
    }
  }, []);

  /* Polling: fetch messages every 3 seconds */
  useEffect(() => {
    // Initial load
    loadMessages();

    // Start polling
    pollingRef.current = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [loadMessages]);

  /* Send message handler — sends to API + updates local state */
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const trimmedText = inputText.trim();

    // Optimistically add to local state
    const newMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      sender: 'Player',
      tag: '[You]',
      text: trimmedText,
      color: '#4fc3f7',
      type: 'alliance',
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Send to API
    setIsLoading(true);
    setApiError(null);
    try {
      const result = await sendMessage(trimmedText);
      if (result) {
        // Replace local optimistic message with server response if available
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== newMsg.id);
          const serverMsg = apiMessageToLocal(result);
          return [...filtered, serverMsg];
        });
        setUsingBackend(true);
      }
    } catch (err) {
      console.warn('[Go2GalaxyChat] Send failed, keeping local message:', err);
      setApiError(err instanceof Error ? err.message : 'Send failed');
      // Local message remains as fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: 10,
        width: 300,
        height: isExpanded ? 200 : 28,
        backgroundColor: 'rgba(5, 10, 20, 0.92)',
        border: '1px solid rgba(100, 150, 255, 0.15)',
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 50,
        transition: 'height 0.2s ease',
      }}
    >
      {/* -------------------- Header -------------------- */}
      <div
        style={{
          padding: '5px 10px',
          backgroundColor: 'rgba(20, 50, 100, 0.4)',
          borderBottom: isExpanded ? '1px solid rgba(100, 150, 255, 0.12)' : 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            color: '#64b5f6',
            fontWeight: 'bold',
            letterSpacing: 0.5,
          }}
        >
          <span style={{ marginRight: 4 }}>&#128172;</span>
          Chat
          {usingBackend && (
            <span style={{ marginLeft: 4, color: '#4caf50', fontSize: 8 }}>●</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {isLoading && (
            <span style={{ color: '#ffd54f', fontSize: 9 }}>⟳</span>
          )}
          {apiError && (
            <span style={{ color: '#ff6b6b', fontSize: 9 }} title={apiError}>!</span>
          )}
          <span
            style={{
              color: 'rgba(100, 150, 255, 0.5)',
              fontSize: 10,
              transition: 'transform 0.2s',
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            }}
          >
            &#9660;
          </span>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* ---------------- Messages ---------------- */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '5px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  fontSize: 11,
                  fontFamily: 'monospace',
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                }}
              >
                <span
                  style={{
                    color: msg.color,
                    fontWeight: msg.type === 'alliance' ? 'bold' : 'normal',
                  }}
                >
                  {msg.tag}
                </span>{' '}
                <span
                  style={{
                    color: msg.type === 'system' ? '#90a4ae' : '#cfd8dc',
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* ---------------- Input row ---------------- */}
          <div
            style={{
              padding: '4px 6px',
              borderTop: '1px solid rgba(100, 150, 255, 0.1)',
              display: 'flex',
              gap: 4,
              flexShrink: 0,
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? 'Sending...' : 'Type...'}
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(100, 150, 255, 0.1)',
                borderRadius: 3,
                padding: '3px 8px',
                color: '#e0e0e0',
                fontFamily: 'monospace',
                fontSize: 11,
                outline: 'none',
                opacity: isLoading ? 0.5 : 1,
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              style={{
                backgroundColor: isLoading ? 'rgba(10, 25, 50, 0.6)' : 'rgba(20, 50, 100, 0.6)',
                border: '1px solid rgba(100, 150, 255, 0.2)',
                borderRadius: 3,
                padding: '3px 10px',
                color: isLoading ? '#555577' : '#64b5f6',
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                letterSpacing: 0.5,
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(30, 70, 140, 0.8)';
                }
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = isLoading
                  ? 'rgba(10, 25, 50, 0.6)'
                  : 'rgba(20, 50, 100, 0.6)';
              }}
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

Go2GalaxyChat.displayName = 'Go2GalaxyChat';
