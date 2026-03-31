'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import Win98Window from './Win98Window';

import BoardView from '@/components/views/BoardView';
import ArticleView from '@/components/views/ArticleView';
import RatingView from '@/components/views/RatingView';
import PhotoView from '@/components/views/PhotoView';
import HelpView from '@/components/views/HelpView';

export default function WindowManager() {
  const windows = useAppStore((state) => state.windows);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {windows.map((w) => {
        let content;
        switch (w.type) {
          case 'board':
            content = <BoardView slug={w.slug} />;
            break;
          case 'article':
          case 'page':
            content = <ArticleView slug={w.slug} />;
            break;
          case 'rating':
            content = <RatingView slug={w.slug} />;
            break;
          case 'photo':
            content = <PhotoView slug={w.slug} />;
            break;
          case 'help':
            content = <HelpView />;
            break;
          default:
            content = <div style={{ padding: 16 }}>Unknown content type: {w.type}</div>;
        }

        return (
          <Win98Window key={w.id} id={w.id}>
            {content}
          </Win98Window>
        );
      })}
    </>
  );
}
