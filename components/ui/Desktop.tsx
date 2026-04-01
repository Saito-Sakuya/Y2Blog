'use client';

import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { useAppStore } from '@/lib/store';
import { fetchSiteConfig, SiteConfig } from '@/lib/api';

const iconStyle = {
  width: 48,
  height: 48,
  backgroundColor: 'var(--bg-tertiary)',
  border: '2px solid var(--border)',
  display: 'flex' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  boxShadow: '2px 2px 0 var(--glow-purple)',
};

const labelStyle = {
  fontSize: 12,
  color: 'var(--text-primary)',
  textAlign: 'center' as const,
  textShadow: '0 1px 2px var(--bg-primary)',
};

const itemStyle = {
  display: 'flex' as const,
  flexDirection: 'column' as const,
  alignItems: 'center' as const,
  gap: 8,
  cursor: 'pointer',
  pointerEvents: 'auto' as const,
  padding: 8,
  borderRadius: 4,
  transition: 'background 0.2s',
  width: 80,
};

export default function Desktop() {
  const { openWindow } = useAppStore();
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    fetchSiteConfig().then(setSiteConfig).catch(() => {});
  }, []);

  const footerHtml = (siteConfig?.siteFooter && typeof window !== 'undefined')
    ? DOMPurify.sanitize(siteConfig.siteFooter, {
        ALLOWED_TAGS: ['a', 'b', 'i', 'em', 'strong', 'span', 'br', 'code'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
      })
    : '';

  return (
    <>
      {/* Right-top icons */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'flex-end',
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        {/* Logo */}
        {siteConfig?.siteLogoUrl && (
          <div style={{
            pointerEvents: 'auto',
            marginBottom: 8,
          }}>
            <img
              src={siteConfig.siteLogoUrl}
              alt={siteConfig.siteTitle || 'Logo'}
              style={{
                maxWidth: 72,
                maxHeight: 72,
                imageRendering: 'pixelated',
                filter: 'drop-shadow(2px 2px 0 var(--glow-purple))',
              }}
            />
          </div>
        )}

        {/* Help */}
        <div
          onClick={() => openWindow('help', 'search-help', '帮助 - 搜索指南')}
          style={itemStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--glow-purple)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div style={iconStyle}>
            <span className="font-pixel" style={{ color: 'var(--accent-pink)', fontSize: 24 }}>?</span>
          </div>
          <span className="font-sans" style={labelStyle}>帮助</span>
        </div>

        {/* License */}
        {siteConfig?.siteLicense && (
          <div
            onClick={() => openWindow('license', 'site-license', '内容协议')}
            style={itemStyle}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--glow-purple)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div style={iconStyle}>
              <span className="font-pixel" style={{ color: 'var(--accent-purple)', fontSize: 16 }}>CC</span>
            </div>
            <span className="font-sans" style={labelStyle}>协议</span>
          </div>
        )}
      </div>

      {/* Footer — bottom-left, above taskbar */}
      {footerHtml && (
        <div
          className="font-sans"
          style={{
            position: 'absolute',
            bottom: 40,
            left: 16,
            pointerEvents: 'auto',
            zIndex: 1,
            fontSize: 11,
            color: 'var(--text-muted)',
            maxWidth: 420,
            lineHeight: 1.6,
            textShadow: '0 1px 3px var(--bg-primary)',
          }}
          dangerouslySetInnerHTML={{ __html: footerHtml }}
        />
      )}
    </>
  );
}

