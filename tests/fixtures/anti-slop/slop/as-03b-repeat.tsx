import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function SyncIcon() {
  const iconRef = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    const motion = gsap.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to(iconRef.current, { rotation: 360, duration: 2, repeat: -1 });
    });
  });

  return <svg ref={iconRef} width={16} height={16} />;
}
