'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { fetchPreviewContent } from '@/lib/api';
import { getTagColor } from '@/lib/colors';

type PreviewState =
  | { status: 'loading' }
  | { status: 'ok'; data: any; html: string }
  | { status: 'expired' }
  | { status: 'error'; message: string };

export default function PreviewPage() {
  const params = useParams();
  const token = params.token as string;
  const [state, setState] = useState<PreviewState>({ status: 'loading' });

  useEffect(() => {
    if (!token) return;

    fetchPreviewContent(token)
      .then(async (data) => {
        let html = '';
        const raw = data.contentRaw || data.content || '';
        if (raw) {
          const parsed = await marked.parse(raw);
          html = DOMPurify.sanitize(parsed);
        }
        setState({ status: 'ok', data, html });
      })
      .catch((err) => {
        if (err.message === 'EXPIRED') {
          setState({ status: 'expired' });
        } else {
          setState({ status: 'error', message: err.message });
        }
      });
  }, [token]);

  // Loading
  if (state.status === 'loading') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontFamily: 'var(--font-pixel), monospace',
        fontSize: 12, color: 'var(--text-secondary)'
      }}>
        Loading preview...
      </div>
    );
  }

  // Expired
  if (state.status === 'expired') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontFamily: 'var(--font-pixel), monospace', gap: 16
      }}>
        <div style={{ fontSize: 48 }}>⏰</div>
        <h1 style={{ fontSize: 14, color: 'var(--accent-pink)' }}>Preview Expired</h1>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 400, textAlign: 'center', lineHeight: 1.8 }}>
          This preview token has expired (15 min limit). Please go back to the Admin Panel and click "Preview" again to generate a new link.
        </p>
      </div>
    );
  }

  // Error
  if (state.status === 'error') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontFamily: 'var(--font-pixel), monospace', gap: 16
      }}>
        <div style={{ fontSize: 48 }}>❌</div>
        <h1 style={{ fontSize: 14, color: 'var(--accent-pink)' }}>Preview Error</h1>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{state.message}</p>
      </div>
    );
  }

  // Render the preview
  const { data, html } = state;

  return (
    <div style={{ minHeight: '100vh', overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
      {/* Preview Mode Banner */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: '#8b7aab',
        color: '#fff',
        padding: '8px 16px',
        fontFamily: 'var(--font-pixel), monospace',
        fontSize: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderBottom: '2px solid var(--border)'
      }}>
        <span>👁️</span>
        <span>PREVIEW MODE — This is a draft and is not publicly visible</span>
        <span>👁️</span>
      </div>

      {/* Content Area — styled like ArticleView */}
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '48px 40px',
      }}>
        {/* Title */}
        <h1 className="font-pixel" style={{ fontSize: 20, marginBottom: 24, color: 'var(--text-primary)' }}>
          {data.title}
        </h1>

        {/* Meta */}
        <div style={{
          fontFamily: 'var(--font-mono), monospace', fontSize: 12, color: 'var(--text-secondary)',
          borderBottom: '1px dashed var(--border)', paddingBottom: 16, marginBottom: 24,
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8
        }}>
          <span>{data.date}</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{
            backgroundColor: 'var(--bg-tertiary)', padding: '2px 8px',
            border: '1px solid var(--border)', fontSize: 10,
            color: 'var(--accent-pink)'
          }}>
            {data.type}
          </span>
          {data.tags?.length > 0 && (
            <>
              <span style={{ color: 'var(--border)' }}>|</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {data.tags.map((tag: string) => (
                  <span
                    key={tag}
                    style={{
                      color: getTagColor(tag),
                      border: `1px solid ${getTagColor(tag)}`,
                      padding: '2px 6px',
                      backgroundColor: 'var(--bg-tertiary)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Rendered HTML Content */}
        {html && (
          <div
            className="font-serif y2k-markdown"
            style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-primary)' }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}

        {/* Rating-specific: score display */}
        {data.type === 'rating' && data.score != null && (
          <div style={{
            marginTop: 32, padding: 16, backgroundColor: 'var(--bg-tertiary)',
            border: '2px solid var(--border)', textAlign: 'center'
          }}>
            <span className="font-pixel" style={{ fontSize: 11, color: 'var(--text-muted)' }}>SCORE</span>
            <div className="font-pixel" style={{ fontSize: 32, color: 'var(--accent-pink)', marginTop: 8 }}>
              {data.score.toFixed(1)}
            </div>
          </div>
        )}

        {/* Photo-specific: pages gallery */}
        {data.type === 'photo' && data.pages?.length > 0 && (
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {data.pages.map((page: any, idx: number) => (
              <div key={idx} style={{ border: '2px solid var(--border)', padding: 8, backgroundColor: 'var(--bg-tertiary)' }}>
                {page.image && (
                  <img
                    src={page.image}
                    alt={`Photo ${idx + 1}`}
                    style={{ width: '100%', display: 'block', imageRendering: 'auto' }}
                  />
                )}
                {page.text && (
                  <p style={{ padding: '8px 4px', fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'var(--font-serif)' }}>
                    {page.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 48, padding: '16px 0',
          borderTop: '1px dashed var(--border)',
          fontFamily: 'var(--font-pixel), monospace',
          fontSize: 9,
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          Preview generated at {new Date().toLocaleString()} · Token expires after 15 minutes
        </div>
      </div>
    </div>
  );
}
