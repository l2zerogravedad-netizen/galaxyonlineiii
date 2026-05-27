'use client';

import React, { useState, useRef, useEffect } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type MessageType = 'system' | 'alliance';

interface ChatMessage {
  id: string;
  sender: string;
  tag: string;
  text: string;
  color: string;
  type: MessageType;
}

/* ------------------------------------------------------------------ */
/*  Initial mock messages (exact GO2 format)                           */
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Go2GalaxyChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll to bottom on new messages */
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  /* Send message handler */
  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Player',
      tag: '[You]',
      text: inputText.trim(),
      color: '#4fc3f7',
      type: 'alliance',
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
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
        </span>
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
              placeholder="Type..."
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
              }}
            />
            <button
              onClick={handleSend}
              style={{
                backgroundColor: 'rgba(20, 50, 100, 0.6)',
                border: '1px solid rgba(100, 150, 255, 0.2)',
                borderRadius: 3,
                padding: '3px 10px',
                color: '#64b5f6',
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: 'bold',
                cursor: 'pointer',
                letterSpacing: 0.5,
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(30, 70, 140, 0.8)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(20, 50, 100, 0.6)';
              }}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

Go2GalaxyChat.displayName = 'Go2GalaxyChat';
