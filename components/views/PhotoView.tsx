'use client';

import React, { useEffect, useState, useRef } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { fetchPostContent } from '@/lib/api';
import clsx from 'clsx';
import { getTagColor } from '@/lib/colors';
import { useAppStore } from '@/lib/store';
import styles from './PhotoView.module.css';

export default function PhotoView({ slug }: { slug: string }) {
  const [data, setData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [scanDirection, setScanDirection] = useState<'down' | 'up'>('down');
  const scanlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPostContent(slug).then((res) => {
      // pre-parse markdown for all pages
      if (res.pages) {
        Promise.all(res.pages.map(async (p: any) => ({
          ...p,
          html: DOMPurify.sanitize(await marked.parse(p.textRaw || p.text || ''))
        }))).then(parsedPages => {
          setData({ ...res, pages: parsedPages });
        });
      } else {
        setData(res);
      }
    }).catch(console.error);
  }, [slug]);

  if (!data) return <div style={{ padding: 16 }}>Loading...</div>;

  const pages = data.pages || [];
  if (pages.length === 0) return <div style={{ padding: 16 }}>No photos available.</div>;

  const handlePageChange = (newIdx: number) => {
    if (newIdx < 0 || newIdx >= pages.length || isAnimating) return;
    
    setScanDirection(newIdx > currentPage ? 'down' : 'up');
    setIsAnimating(true);
    // Trigger CRT scanline animation via css
    setTimeout(() => {
      setCurrentPage(newIdx);
    }, 100); // midway scanline covers content

    setTimeout(() => {
      setIsAnimating(false);
    }, 200); // full scanline duration
  };

  const current = pages[currentPage];

  return (
    <div className={styles.container}>
      <div className={clsx(styles.header, 'font-pixel')}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span>{data.title}</span>
          <div style={{ display: 'flex', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
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
                  paddingTop: 3
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <span className="font-mono" style={{ marginLeft: 16, color: 'var(--text-secondary)' }}>
          {currentPage + 1} / {pages.length}
        </span>
      </div>

      <div className={styles.contentArea}>
        {/* Sync CRT Scanline */}
        {isAnimating && <div className={clsx(styles.scanline, scanDirection === 'up' && styles.scanlineUp)} ref={scanlineRef} />}
        
        <div className={styles.leftPane}>
          {current.image ? (
            <img src={current.image} alt={`Page ${currentPage + 1}`} className={styles.image} />
          ) : (
            <div className={styles.placeholder}>IMAGE PENDING</div>
          )}
        </div>
        
        <div className={styles.rightPane}>
          <div 
            className="font-serif y2k-markdown" 
            style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-primary)' }}
            dangerouslySetInnerHTML={{ __html: current.html }} 
          />
        </div>
      </div>

      <div className={styles.footer}>
        <button 
          className={clsx('font-pixel', 'win-btn-depressed', styles.pageBtn)} 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0 || isAnimating}
        >
          {'< PREV'}
        </button>
        <div className={styles.dots}>
          {pages.map((_: any, i: number) => (
            <div key={i} className={clsx(styles.dot, i === currentPage && styles.dotActive)} />
          ))}
        </div>
        <button 
          className={clsx('font-pixel', 'win-btn-depressed', styles.pageBtn)} 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pages.length - 1 || isAnimating}
        >
          {'NEXT >'}
        </button>
      </div>
    </div>
  );
}
