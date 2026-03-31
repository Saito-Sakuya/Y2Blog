'use client';

import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { fetchPostContent, fetchAISummary } from '@/lib/api';
import SVGRadar from '../ui/SVGRadar';
import clsx from 'clsx';
import { getTagColor } from '@/lib/colors';
import { useAppStore } from '@/lib/store';
import styles from './RatingView.module.css';

export default function RatingView({ slug }: { slug: string }) {
  const [data, setData] = useState<any>(null);
  const [html, setHtml] = useState<string>('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchPostContent(slug).then(async (res) => {
      setData(res);
      if (res.content) {
        setHtml(DOMPurify.sanitize(await marked.parse(res.content)));
      }

      // Fetch AI Summary
      if (res.title) {
        setAiLoading(true);
        const getSummary = async (retries = 3) => {
          try {
            const sumRes = await fetchAISummary(res.title, res.tags || []);
            if (sumRes.status === 'generating' && retries > 0) {
              setTimeout(() => getSummary(retries - 1), 2000);
            } else {
              setAiSummary(sumRes.summary || sumRes.message);
              setAiLoading(false);
            }
          } catch (e) {
            setAiSummary("Failed to load AI summary.");
            setAiLoading(false);
          }
        };
        getSummary();
      }
    }).catch(console.error);
  }, [slug]);

  if (!data) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: 24, gap: 24 }}>
      {/* Region A: Cover & Summary */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div className={styles.coverContainer}>
          {data.cover ? <img src={data.cover} alt="cover" className={styles.coverImage} /> : 'No Cover'}
        </div>

        <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="win-border" style={{ padding: 16, backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="font-pixel" style={{ fontSize: 12, marginBottom: 8, color: 'var(--accent-pink)' }}>{'>'} AI 简述</h3>
            <p className="font-sans" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {aiLoading ? <span style={{ animation: 'breathe 1s infinite' }}>生成中...</span> : aiSummary}
            </p>
          </div>
          <div className="win-border" style={{ padding: 16, backgroundColor: 'var(--bg-tertiary)', display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <h3 className="font-pixel" style={{ fontSize: 12, marginBottom: 8 }}>{'>'} 我的评价</h3>
              <p className="font-serif" style={{ fontSize: 16, color: 'var(--text-primary)' }}>{data.summary}</p>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 4 }}>
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
                        padding: '2px 4px',
                        backgroundColor: 'var(--bg-primary)',
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
                <span>| 字数：{data.wordCount || 0}</span>
                <span>| 阅读：{data.readTime || 0} min</span>
              </div>
            </div>
            
            {/* The Rating Orange Box! */}
            <div style={{
              width: 100,
              minHeight: 80,
              border: '3px solid var(--accent-orange)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              marginLeft: 16,
              backgroundColor: 'var(--bg-primary)'
            }}>
              <span className="font-pixel" style={{ fontSize: 24, color: 'var(--accent-orange)' }}>{data.score !== undefined ? data.score : '-'}</span>
              <span className="font-sans" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>SCORE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Region B: Radar Charts */}
      {data.radarCharts && data.radarCharts.length > 0 && (
        <div style={{ 
          display: 'flex', gap: 16, padding: '16px 0', 
          borderTop: '2px dashed var(--border)', borderBottom: '2px dashed var(--border)',
          overflowX: 'auto'
        }}>
          {data.radarCharts.map((chart: any, i: number) => (
            <SVGRadar key={i} data={chart} size={150} />
          ))}
        </div>
      )}

      {/* Region C: Content */}
      <div 
        className="font-serif y2k-markdown" 
        style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-primary)' }}
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    </div>
  );
}
