'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';

export default function Desktop() {
  const { openWindow } = useAppStore();

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      alignItems: 'flex-end',
      pointerEvents: 'none', // let clicks pass through the container
      zIndex: 1 // above ocean, below windows
    }}>
      <div 
        onClick={() => openWindow('help', 'search-help', '帮助 - 搜索指南')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          pointerEvents: 'auto',
          padding: 8,
          borderRadius: 4,
          transition: 'background 0.2s',
          width: 80
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--glow-purple)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div style={{
          width: 48,
          height: 48,
          backgroundColor: 'var(--bg-tertiary)',
          border: '2px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '2px 2px 0 var(--glow-purple)'
        }}>
          <span className="font-pixel" style={{ color: 'var(--accent-pink)', fontSize: 24 }}>?</span>
        </div>
        <span className="font-sans" style={{ 
          fontSize: 12, 
          color: 'var(--text-primary)', 
          textAlign: 'center',
          textShadow: '0 1px 2px var(--bg-primary)'
        }}>
          帮助
        </span>
      </div>
    </div>
  );
}
