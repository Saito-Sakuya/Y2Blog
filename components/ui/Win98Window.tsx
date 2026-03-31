'use client';

import React, { useRef, useState, useEffect } from 'react';
import clsx from 'clsx';
import { useAppStore } from '@/lib/store';
import styles from './Win98Window.module.css';

const MinimizeIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <rect x="1" y="8" width="8" height="2" />
  </svg>
);

const MaximizeIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" fillRule="evenodd" clipRule="evenodd">
    <path d="M0 0 H10 V10 H0 Z M1 2 H9 V9 H1 Z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
    <path d="M0 0 L3 4 L0 8 H2 L4 5 L6 8 H8 L5 4 L8 0 H6 L4 3 L2 0 Z" />
  </svg>
);

interface Props {
  id: string;
  children: React.ReactNode;
}

export default function Win98Window({ id, children }: Props) {
  const windowState = useAppStore((state) => state.windows.find((w) => w.id === id));
  const { closeWindow, minimizeWindow, focusWindow, updateWindowBounds, toggleMaximizeWindow } = useAppStore();

  const [isOpening, setIsOpening] = useState(true);
  const [isHiding, setIsHiding] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track initial mount animation
  useEffect(() => {
    const timer = setTimeout(() => setIsOpening(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Screen size detection for Mobile Support
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track minimize state transition to trigger restore animation instead of crtOpen
  const wasMinimized = useRef(windowState?.minimized);
  useEffect(() => {
    if (wasMinimized.current && windowState && !windowState.minimized) {
      setIsRestoring(true);
      setTimeout(() => setIsRestoring(false), 200);
    }
    if (windowState) {
      wasMinimized.current = windowState.minimized;
    }
  }, [windowState?.minimized]);

  // Local drag/resize state
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, winX: 0, winY: 0, winW: 0, winH: 0 });

  if (!windowState) return null;

  const { title, x, y, width, height, zIndex, isMaximized } = windowState;
  const effectiveMaximized = isMaximized || isMobile; // Force maximize on mobile

  const handlePointerDownDrag = (e: React.PointerEvent) => {
    focusWindow(id);
    if (effectiveMaximized) return; // Disallow dragging if maximized
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      winX: x,
      winY: y,
      winW: width,
      winH: height,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerDownResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    focusWindow(id);
    isResizing.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      winX: x,
      winY: y,
      winW: width,
      winH: height,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (containerRef.current) {
        containerRef.current.style.left = `${dragStart.current.winX + dx}px`;
        containerRef.current.style.top = `${Math.max(0, dragStart.current.winY + dy)}px`;
      }
    } else if (isResizing.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (containerRef.current) {
        containerRef.current.style.width = `${Math.max(400, dragStart.current.winW + dx)}px`;
        containerRef.current.style.height = `${Math.max(300, dragStart.current.winH + dy)}px`;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current || isResizing.current) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      
      // Commit final bounds to global state to persist
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      if (isDragging.current) {
        updateWindowBounds(id, {
          x: dragStart.current.winX + dx,
          y: Math.max(0, dragStart.current.winY + dy),
        });
      } else if (isResizing.current) {
        updateWindowBounds(id, {
          width: Math.max(400, dragStart.current.winW + dx),
          height: Math.max(300, dragStart.current.winH + dy),
        });
      }

      isDragging.current = false;
      isResizing.current = false;
    }
  };

  const handleMinimize = () => {
    setIsMinimizing(true);
    setTimeout(() => {
      minimizeWindow(id);
      setIsMinimizing(false); // Reset state so it's clean on restore
    }, 200);
  };

  const handleBack = () => {
    handleClose();
    if (window.innerWidth < 768) {
      const { windows, restoreWindow } = useAppStore.getState();
      const others = windows.filter(w => w.id !== id);
      if (others.length > 0) {
        const target = others[others.length - 1];
        if (target.minimized) {
          setTimeout(() => restoreWindow(target.id), 200);
        }
      }
    }
  };

  const handleClose = () => {
    setIsHiding(true);
    setTimeout(() => {
      closeWindow(id);
    }, 200);
  };

  let animClass = '';
  if (isOpening) animClass = styles.animOpen;
  else if (isHiding) animClass = styles.animClose;
  else if (isMinimizing) animClass = styles.animMinimize;
  else if (isRestoring) animClass = styles.animRestore;

  // When completely minimized and no longer animating shrink, hide it physically
  const isVisuallyHidden = windowState.minimized && !isMinimizing;

  return (
    <div
      ref={containerRef}
      className={clsx(styles.window, 'win-border', 'win-shadow', effectiveMaximized && styles.maximized, animClass)}
      style={{
        display: isVisuallyHidden ? 'none' : 'flex',
        left: x,
        top: y,
        width,
        height,
        zIndex
      }}
      onPointerDown={() => focusWindow(id)}
    >
      <div
        className={styles.titleBar}
        style={{ cursor: effectiveMaximized ? 'default' : 'grab' }}
        onPointerDown={handlePointerDownDrag}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className={styles.title}>
          <span>[ICON]</span> {title}
        </div>
        <div className={styles.controls} onPointerDown={(e) => e.stopPropagation()}>
          <button className={clsx(styles.controlBtn, 'win-btn-depressed')} onClick={handleMinimize}>
            <MinimizeIcon />
          </button>
          {!isMobile && (
            <button className={clsx(styles.controlBtn, 'win-btn-depressed')} onClick={() => toggleMaximizeWindow(id)}>
              <MaximizeIcon />
            </button>
          )}
          <button className={clsx(styles.controlBtn, 'win-btn-depressed')} onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Breadcrumb - optional logic for later */}
      <div className={styles.breadcrumb}>
        <button className={styles.breadcrumbBtn} onClick={handleBack}>
          {'<- 返回'}
        </button>
      </div>

      <div className={styles.content}>
        {children}
      </div>
      <div className={styles.footer}>
        {!effectiveMaximized && (
          <div
            className={styles.resizeHandle}
            onPointerDown={handlePointerDownResize}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        )}
      </div>
    </div>
  );
}
