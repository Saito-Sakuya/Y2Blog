'use client';

import React, { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import { useAppStore } from '@/lib/store';
import styles from './Spotlight.module.css';

import { fetchMenu, fetchSearch, fetchTags } from '@/lib/api';

const PLACEHOLDERS = [
  "搜索文章...",
  "输入关键词...",
  "试试 'Y2K'...",
  "探索这台旧电脑..."
];

export default function Spotlight() {
  const {
    isSpotlightOpen,
    setSpotlightOpen,
    spotlightQuery,
    setSpotlightQuery,
    openWindow,
    windows
  } = useAppStore();

  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [defaultMenu, setDefaultMenu] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchMeta, setSearchMeta] = useState<{ syntax?: string; board?: string }>({});
  const [globalTags, setGlobalTags] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch default menu & tags on mount
  useEffect(() => {
    fetchMenu().then((data) => {
      const boards = data.boards?.map((b: any) => ({ ...b, type: 'board' })) || [];
      const pages = data.pages?.map((p: any) => ({ ...p, type: 'page' })) || [];
      setDefaultMenu([...boards, ...pages]);
    }).catch(console.error);
    
    fetchTags().then((data) => {
      setGlobalTags(data.tags || []);
    }).catch(console.error);
  }, []);

  // Fetch search results when query changes
  useEffect(() => {
    if (!spotlightQuery) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(true);
      fetchSearch(spotlightQuery)
        .then((data) => {
          setSearchResults(data.results || []);
          setSearchMeta({ syntax: data.syntax, board: data.board });
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [spotlightQuery]);

  // Placeholder rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Ctrl+K handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isSpotlightOpen) {
          setSpotlightOpen(false);
          inputRef.current?.blur();
        } else {
          setSpotlightOpen(true);
          inputRef.current?.focus();
        }
      }
      if (e.key === 'Escape' && isSpotlightOpen) {
        setSpotlightOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpotlightOpen, setSpotlightOpen]);

  // Click outside to close (simplified)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.' + styles.container) && !target.closest('#start-btn')) {
        setSpotlightOpen(false);
      }
    };
    if (isSpotlightOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSpotlightOpen, setSpotlightOpen]);

  const handleOpenItem = (item: any) => {
    openWindow(item.type, item.slug, item.title || item.name || 'Unknown');
    setSpotlightOpen(false);
    setSpotlightQuery('');
    const isMobile = window.innerWidth < 768;
    useAppStore.getState().showToast(
      isMobile ? '可点击左侧 START 再次唤起搜索' : '可使用快捷键 Ctrl+K 或点击左下角 START 再次唤起搜索'
    );
  };

  const renderTagSuggestions = () => {
    if (!spotlightQuery.includes('#')) return null;
    const matches = globalTags.filter(t => ('#' + t.name).includes(spotlightQuery.split(' ').pop() || ''));
    if (matches.length === 0) return null;

    return (
      <div style={{ padding: '8px 12px', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 10, lineHeight: 1, paddingTop: 2, color: 'var(--accent-pink)', fontFamily: 'var(--font-pixel)' }}>TAG SUGGESTS: </span>
        {matches.slice(0, 5).map(t => (
          <span 
            key={t.name}
            onClick={() => {
               const parts = spotlightQuery.split(' ');
               parts.pop();
               setSpotlightQuery((parts.length ? parts.join(' ') + ' ' : '') + '#' + t.name + ' ');
               inputRef.current?.focus();
            }}
            style={{ cursor: 'pointer', padding: '2px 6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-primary)' }}
          >
            #{t.name} ({t.count})
          </span>
        ))}
      </div>
    );
  };

  const renderMenu = () => {
    if (!isSpotlightOpen) return null;

    let items = [];
    if (!spotlightQuery) {
      items = defaultMenu;
    } else {
      items = searchResults;
    }

    if (items.length === 0) {
      return (
        <div className={styles.menu}>
          {renderTagSuggestions()}
          <div className={styles.menuItem} style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>
            {isSearching ? '搜索中...' : '没有找到相关记录'}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.menu}>
        {renderTagSuggestions()}
        {searchMeta.syntax && spotlightQuery && (
          <div style={{ padding: '4px 12px', fontSize: 10, color: 'var(--accent-purple)', borderBottom: '1px dashed var(--border)', background: 'var(--bg-tertiary)' }}>
            <span className="font-pixel">SYNTAX: </span> 
            {searchMeta.syntax}
            {searchMeta.board && ` | IN BOARD: @${searchMeta.board}`}
          </div>
        )}
        {items.map((item) => (
          <div key={`${item.type}-${item.slug}`} className={styles.menuItem} onClick={() => handleOpenItem(item)}>
            <div className={styles.menuItemIcon} style={{ color: item.color || 'inherit' }}>
              {item.type === 'page' ? '#' : item.type === 'board' ? '*' : '>'}
            </div>
            <div className={styles.menuItemTitle}>
              [{item.type === 'article' ? '文章' : item.type === 'board' ? '板块' : item.type === 'rating' ? '评分' : '页面'}] {item.title || item.name}
            </div>
            <div className={styles.menuItemMeta} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {item.date && <span>{item.date}</span>}
              {item.score !== undefined && <span style={{ color: 'var(--accent-orange)' }}>⭐ {item.score}</span>}
              {item.tags && <span>#{item.tags.join(' #')}</span>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!isSpotlightOpen && windows.length > 0) return null;

  return (
    <div className={styles.container}>
      <div className={clsx(styles.searchBox, isSpotlightOpen ? styles.searchBoxFocused : styles.breathing)}>
        <span className={styles.icon}>{'>_'}</span>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={PLACEHOLDERS[placeholderIdx]}
          value={spotlightQuery}
          onChange={(e) => setSpotlightQuery(e.target.value)}
          onFocus={() => setSpotlightOpen(true)}
        />
      </div>
      {renderMenu()}
    </div>
  );
}
