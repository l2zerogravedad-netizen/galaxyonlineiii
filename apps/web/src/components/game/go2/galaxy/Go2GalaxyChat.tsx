'use client';

import React, { useState } from 'react';

interface ChatMessage {
  id: string;
  sender: string;
  alliance: string;
  text: string;
  timestamp: string;
  color: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'System',
    alliance: '',
    text: 'Welcome to Galaxy Online III - Server 1',
    timestamp: '10:00',
    color: '#fbbf24',
  },
  {
    id: '2',
    sender: 'Ginjaa',
    alliance: '[D]',
    text: 'Fleet moving to sector [12,8]',
    timestamp: '10:05',
    color: '#4dabf7',
  },
  {
    id: '3',
    sender: 'Mordor',
    alliance: '[I]',
    text: 'Alliance war starts in 30 minutes',
    timestamp: '10:12',
    color: '#ff6b6b',
  },
  {
    id: '4',
    sender: 'Vibrio',
    alliance: '[S]',
    text: 'Need reinforcements at sector [5,14]',
    timestamp: '10:15',
    color: '#69db7c',
  },
  {
    id: '5',
    sender: 'Krum',
    alliance: '[C]',
    text: 'Trading post established',
    timestamp: '10:18',
    color: '#ffd43b',
  },
  {
    id: '6',
    sender: 'GodSlayer',
    alliance: '[IND]',
    text: 'Anyone selling crystal?',
    timestamp: '10:22',
    color: '#adb5bd',
  },
];

export const Go2GalaxyChat: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: 10,
        width: isExpanded ? 340 : 280,
        height: isExpanded ? 260 : 180,
        backgroundColor: 'rgba(2, 4, 8, 0.88)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '6px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            color: '#f59e0b',
            letterSpacing: 1,
          }}
        >
          ● ALLIANCE CHAT
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
          {isExpanded ? '▼' : '▲'}
        </span>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '6px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {INITIAL_MESSAGES.map((msg) => (
          <div key={msg.id} style={{ fontSize: 11, fontFamily: 'monospace' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>
              {msg.timestamp}
            </span>{' '}
            <span style={{ color: msg.color, fontWeight: 'bold' }}>
              {msg.sender}
            </span>
            {msg.alliance && (
              <span style={{ color: msg.color, opacity: 0.7 }}> {msg.alliance}</span>
            )}
            <span style={{ color: '#ced4da' }}>: {msg.text}</span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        style={{
          padding: '4px 8px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          gap: 6,
        }}
      >
        <input
          type="text"
          placeholder="Type message..."
          style={{
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 4,
            padding: '4px 8px',
            color: '#e9ecef',
            fontFamily: 'monospace',
            fontSize: 11,
            outline: 'none',
          }}
        />
        <button
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 4,
            padding: '4px 10px',
            color: '#f59e0b',
            fontFamily: 'monospace',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

Go2GalaxyChat.displayName = 'Go2GalaxyChat';
