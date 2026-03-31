'use client';

import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { fetchPostContent } from '@/lib/api';
import { getTagColor } from '@/lib/colors';
import { useAppStore } from '@/lib/store';

export default function ArticleView({ slug }: { slug: string }) {
  const [data, setData] = useState<any>(null);
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    fetchPostContent(slug).then(async (res) => {
      setData(res);
      if (res.content) {
         // marked.parse can be sync or async depending on configuration, explicitly await if using promise version, 
         // but synchronous parse is default.
        const parsed = await marked.parse(res.content);
        setHtml(DOMPurify.sanitize(parsed));
      }
    });
  }, [slug]);

  if (!data) return <div style={{ padding: 16, fontFamily: 'var(--font-sans)' }}>Loading...</div>;

  return (
    <div style={{ padding: "32px 40px" }}>
      <h1 className="font-pixel" style={{ fontSize: 20, marginBottom: 24 }}>{data.title}</h1>
      <div style={{ 
        fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)',
        borderBottom: '1px dashed var(--border)', paddingBottom: 16, marginBottom: 24,
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8
      }}>
        <span>{data.date}</span>
        <span style={{ color: 'var(--border)' }}>|</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {data.tags?.map((tag: string) => (
            <span 
              key={tag} 
              onClick={() => {
                const { setSpotlightQuery, setSpotlightOpen } = useAppStore.getState();
                setSpotlightQuery(`#${tag}`);
                setSpotlightOpen(true);
              }}
              style={{ 
                color: getTagColor(tag), 
                border: `1px solid ${getTagColor(tag)}`, 
                padding: '2px 6px',
                backgroundColor: 'var(--bg-tertiary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                lineHeight: 1,
                paddingTop: 3 /* Optical correction for pixel fonts */
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span>{data.readTime || 8} min read</span>
      </div>
      <div 
        className="font-serif y2k-markdown" 
        style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-primary)' }}
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    </div>
  );
}
