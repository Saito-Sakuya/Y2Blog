'use client';

import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useAppStore } from '@/lib/store';
import styles from './Taskbar.module.css';

export default function Taskbar() {
  const {
    windows,
    activeZIndex,
    focusWindow,
    restoreWindow,
    setSpotlightOpen,
    isSpotlightOpen,
    theme,
    toggleTheme,
    particleEnabled,
    toggleParticle,
  } = useAppStore();

  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);

  // Clock effect
  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleStartClick = () => {
    setSpotlightOpen(!isSpotlightOpen);
  };

  const handleWindowClick = (id: string, isMinimized: boolean, isActive: boolean) => {
    if (isMinimized) {
      restoreWindow(id);
    } else if (isActive) {
      // Since it's active and clicked on taskbar, typical OS behavior is minimize
      useAppStore.getState().minimizeWindow(id);
    } else {
      focusWindow(id);
    }
  };

  return (
    <div className={styles.taskbar}>
      <div className={styles.left}>
        <button
          id="start-btn"
          className={clsx(
            styles.startBtn,
            isSpotlightOpen ? 'win-btn-pressed' : 'win-btn-depressed'
          )}
          onClick={handleStartClick}
        >
          {'>_'} START
        </button>
      </div>

      <div className={styles.middle}>
        {mounted && windows.map((w) => {
          const isActive = w.zIndex === activeZIndex && !w.minimized;
          return (
            <button
              key={w.id}
              className={clsx(
                styles.winBtn,
                isActive ? 'win-btn-pressed' : 'win-btn-depressed'
              )}
              onClick={() => handleWindowClick(w.id, w.minimized, isActive)}
              title={w.title}
            >
              <span className={styles.winBtnText}>{w.title}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.right}>
        <button
          className={clsx(styles.iconBtn, 'win-btn-depressed')}
          onClick={toggleParticle}
          title="Toggle Particles"
        >
          {particleEnabled ? '*' : ' '}
        </button>
        <button
          className={clsx(styles.iconBtn, 'win-btn-depressed')}
          onClick={toggleTheme}
          title={`Theme: ${theme}`}
          style={{ 
            transition: 'transform 0.3s, color 0.3s', 
            transform: theme === 'light' ? 'rotate(180deg)' : theme === 'system' ? 'rotate(90deg)' : 'none',
            color: theme === 'system' ? 'var(--accent-primary)' : 'inherit'
          }}
        >
          #
        </button>
        <div className={styles.clock}>{time}</div>
      </div>
    </div>
  );
}
