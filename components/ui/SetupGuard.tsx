'use client';

import { useEffect, useState } from 'react';

/**
 * SetupGuard — Displayed when the system has not been initialized yet.
 * Shows a retro Y2K-styled full-screen overlay prompting the user to
 * configure the blog via the admin setup wizard.
 */
export default function SetupGuard() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Use the Nginx-proxied admin path
  const adminUrl = '/admin/setup';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000080',
      fontFamily: '"Press Start 2P", "Courier New", monospace',
      color: '#ffffff',
      imageRendering: 'pixelated',
    }}>
      <div style={{
        border: '4px solid #c0c0c0',
        background: '#000080',
        padding: '48px',
        maxWidth: '640px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '8px 8px 0px #000000',
      }}>
        {/* BSOD-style title bar */}
        <div style={{
          background: '#c0c0c0',
          color: '#000080',
          padding: '4px 12px',
          marginBottom: '32px',
          fontSize: '14px',
          fontWeight: 'bold',
          letterSpacing: '2px',
        }}>
          Y2K PIXEL BLOG
        </div>

        {/* Main message */}
        <div style={{ fontSize: '12px', lineHeight: '2.2', marginBottom: '32px' }}>
          <p style={{ marginBottom: '16px', color: '#ffff00' }}>
            SYSTEM NOT INITIALIZED{dots}
          </p>
          <p style={{ marginBottom: '8px' }}>
            This blog has not been configured yet.
          </p>
          <p>
            Please complete the initial setup via the
          </p>
          <p style={{ marginBottom: '16px' }}>
            Admin Control Panel.
          </p>
        </div>

        {/* CTA Button */}
        <a
          href={adminUrl}
          style={{
            display: 'inline-block',
            background: '#c0c0c0',
            color: '#000000',
            border: '2px outset #ffffff',
            padding: '8px 24px',
            fontSize: '11px',
            fontFamily: '"Press Start 2P", monospace',
            textDecoration: 'none',
            cursor: 'pointer',
            letterSpacing: '1px',
          }}
          onMouseEnter={e => {
            (e.target as HTMLAnchorElement).style.background = '#a0a0a0';
            (e.target as HTMLAnchorElement).style.borderStyle = 'inset';
          }}
          onMouseLeave={e => {
            (e.target as HTMLAnchorElement).style.background = '#c0c0c0';
            (e.target as HTMLAnchorElement).style.borderStyle = 'outset';
          }}
        >
          OPEN SETUP WIZARD
        </a>

        {/* Footer hint */}
        <p style={{
          marginTop: '32px',
          fontSize: '8px',
          color: '#808080',
          lineHeight: '1.8',
        }}>
          Press any key to continue{dots}
        </p>
      </div>
    </div>
  );
}
