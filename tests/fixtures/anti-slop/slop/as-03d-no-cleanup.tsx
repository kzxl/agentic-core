import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function OrderRow() {
  const rowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.from(rowRef.current, { autoAlpha: 0, duration: prefersReducedMotion ? 0 : 0.18 });
  }, []);

  return <tr ref={rowRef} />;
}
