'use client';

import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useAppStore } from '@/lib/store';
import { fetchBoardContent } from '@/lib/api';

export default function BoardView({ slug }: { slug: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [boardInfo, setBoardInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { openWindow } = useAppStore();

  const [sort, setSort] = useState<'date' | 'title' | 'score'>('date');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchBoardContent(slug).then((res) => {
      setItems(res.items || []);
      setBoardInfo(res.board || null);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  let displayedItems = [...items];
  if (filterType !== 'all') {
    displayedItems = displayedItems.filter((i) => i.type === filterType);
  }
  displayedItems.sort((a, b) => {
    let diff = 0;
    if (sort === 'date') {
      diff = new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    } else if (sort === 'score') {
      diff = (b.score || 0) - (a.score || 0); // Sort primarily by score
    } else {
      diff = a.title.localeCompare(b.title);
    }
    return order === 'desc' ? diff : -diff;
  });

  const handleSort = (s: 'date' | 'title' | 'score') => {
    if (sort === s) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSort(s);
      setOrder(s === 'title' ? 'asc' : 'desc'); // titles default to asc, dates/scores default to desc
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '4px 8px',
        borderBottom: '2px solid var(--border)',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button 
            className={clsx('font-sans', sort === 'date' ? 'win-btn-pressed' : 'win-btn-depressed')}
            onClick={() => handleSort('date')}
            style={{ fontSize: 12, padding: '2px 8px' }}
          >
            时间 {sort === 'date' ? (order === 'desc' ? '▼' : '▲') : '▼'}
          </button>
          <button 
            className={clsx('font-sans', sort === 'title' ? 'win-btn-pressed' : 'win-btn-depressed')}
            onClick={() => handleSort('title')}
            style={{ fontSize: 12, padding: '2px 8px' }}
          >
            标题 {sort === 'title' ? (order === 'desc' ? '▼' : '▲') : '▼'}
          </button>
          {filterType === 'rating' && (
            <button 
              className={clsx('font-sans', sort === 'score' ? 'win-btn-pressed' : 'win-btn-depressed')}
              onClick={() => handleSort('score')}
              style={{ fontSize: 12, padding: '2px 8px' }}
            >
              评分 {sort === 'score' ? (order === 'desc' ? '▼' : '▲') : '▼'}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['all', 'rating', 'article', 'photo'].map((t) => (
            <button
              key={t}
              className={clsx('font-sans', filterType === t ? 'win-btn-pressed' : 'win-btn-depressed')}
              onClick={() => setFilterType(t)}
              style={{ fontSize: 12, padding: '2px 8px' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ padding: 16, overflowY: 'auto' }}>
        {displayedItems.length === 0 ? (
          <div style={{ color: 'var(--text-muted)' }}>* No items found *</div>
        ) : (
          displayedItems.map((item) => (
            <div 
              key={item.slug} 
              style={{ padding: '8px 0', cursor: 'pointer', borderBottom: '1px dashed var(--border)' }}
              onClick={() => openWindow(item.type, item.slug, item.title)}
            >
              <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>{item.date}</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: 14 }}>{item.title}</span>
                <span style={{ marginLeft: 'auto', background: 'var(--bg-tertiary)', padding: '0 4px' }}>[{item.type}]</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
