'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Landing from '@/components/lexilens/Landing';

const Reader = dynamic(() => import('@/components/lexilens/Reader'), {
  ssr: false,
});

export default function Home() {
  const [view, setView] = useState<'landing' | 'reader'>('landing');

  useEffect(() => {
    // scroll to top when switching views
    window.scrollTo({ top: 0 });
  }, [view]);

  return (
    <main>
      {view === 'landing' ? (
        <Landing onStart={() => setView('reader')} />
      ) : (
        <Reader onExit={() => setView('landing')} />
      )}
    </main>
  );
}
