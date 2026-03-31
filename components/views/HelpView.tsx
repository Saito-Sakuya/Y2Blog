'use client';

import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export default function HelpView() {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/help')
      .then(res => res.json())
      .then(async data => {
        if (data.content) {
          const parsed = await marked.parse(data.content);
          setHtml(DOMPurify.sanitize(parsed));
        } else {
          setHtml('<p>Error loading help content.</p>');
        }
        setLoading(false);
      })
      .catch(() => {
        setHtml('<p>Failed to load help file.</p>');
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 16, fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}>Loading Help System...</div>;

  return (
    <div style={{ padding: "32px 40px" }}>
      <div 
        className="font-serif y2k-markdown" 
        style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-primary)' }}
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    </div>
  );
}
