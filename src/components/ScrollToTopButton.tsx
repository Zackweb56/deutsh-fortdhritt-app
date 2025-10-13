import React from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const smoothScrollToTop = (duration = 600) => {
    const start = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    if (start <= 0) return;
    const startTime = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const y = Math.round(start * (1 - easeOutCubic(t)));
      window.scrollTo(0, y);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  return (
    <button
      onClick={() => smoothScrollToTop(700)}
      aria-label="Scroll to top"
      className={`
        fixed bottom-6 right-6 z-50
        h-12 w-12 rounded-full
        flex items-center justify-center
        shadow-lg border border-border
        bg-primary text-primary-foreground
        hover:bg-accent hover:text-accent-foreground
        transition-opacity transition-colors
        ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
};

export default ScrollToTopButton;


