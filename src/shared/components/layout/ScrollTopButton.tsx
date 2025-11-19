import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollTopButton({ slideContainerRef }: { slideContainerRef?: React.RefObject<HTMLElement | null> }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = slideContainerRef?.current;
    if (!el) return;
    const onScroll = () => setVisible(el.scrollTop > 180);
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [slideContainerRef]);

  const scrollToTop = () => {
    const el = slideContainerRef?.current;
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      className={`fixed right-6 bottom-24 p-3 rounded-full bg-white shadow-lg transition-transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}
      onClick={scrollToTop}
      aria-label="Ir ao topo do slide"
      title="Ir ao topo"
    >
      <ArrowUp size={18} />
    </button>
  );
}
