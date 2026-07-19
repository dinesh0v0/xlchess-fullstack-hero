import { useState, useEffect, useRef } from 'react';

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'top'>('top');
  const lastScrollYRef = useRef(0);
  
  useEffect(() => {
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset;

      if (scrollY < 50) {
        setScrollDirection('top');
      } else if (Math.abs(scrollY - lastScrollYRef.current) < 10) {
        ticking = false;
        return;
      } else if (scrollY > lastScrollYRef.current) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }

      lastScrollYRef.current = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    updateScrollDir();

    return () => window.removeEventListener('scroll', onScroll);
  }, []); // empty deps: mount once, no listener churn

  return scrollDirection;
}
