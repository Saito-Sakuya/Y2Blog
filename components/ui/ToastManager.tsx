'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import clsx from 'clsx';
import styles from './ToastManager.module.css';

export default function ToastManager() {
  const { toastMessage, clearToast } = useAppStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toastMessage) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(clearToast, 300); // Wait for transition fade
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, clearToast]);

  if (!toastMessage && !isVisible) return null;

  return (
    <div className={clsx(styles.toast, 'win-border', 'win-shadow', isVisible ? styles.toastEnter : styles.toastLeave)}>
      <div className={styles.toastHeader}>
        <span className="font-pixel" style={{ fontSize: 10 }}>💡 System Hint</span>
        <button className={clsx('win-btn-depressed', styles.closeBtn)} onClick={() => setIsVisible(false)}>X</button>
      </div>
      <div className={styles.toastBody}>
        {toastMessage}
      </div>
    </div>
  );
}
