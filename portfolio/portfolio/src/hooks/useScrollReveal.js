import { useEffect } from 'react';
import { useTheme } from '../context/useTheme.js';

export function useScrollReveal(ref) {
  const { reducedMotion } = useTheme();
  useEffect(() => {
    if (reducedMotion || !ref.current || !('IntersectionObserver' in window)) return;
    const animations = new Set();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        // Content remains visible and usable when animation is unsupported or disabled.
        if (!entry.target.animate) continue;
        const animation = entry.target.animate([
          { opacity: .35, transform: 'translateY(18px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 500, easing: 'cubic-bezier(.2,.7,.2,1)' });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, { rootMargin: '0px 0px -32px 0px', threshold: 0 });
    ref.current.querySelectorAll(':scope > section:not(#home)').forEach(section => observer.observe(section));
    return () => { observer.disconnect(); animations.forEach(animation => animation.cancel()); };
  }, [ref, reducedMotion]);
}
