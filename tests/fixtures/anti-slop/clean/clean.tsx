import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function DetailPanel({ isOpen }: { isOpen: boolean }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const motion = gsap.matchMedia();
      motion.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(panelRef.current, { x: 16, autoAlpha: 0, duration: 0.18 });
      });
      return () => motion.revert();
    },
    { dependencies: [isOpen] }
  );

  return (
    <div ref={panelRef} className="rounded-md border border-slate-200 bg-white p-3">
      <span className="h-6 w-6 rounded-full bg-slate-200" data-role="avatar" />
      <button type="button" className="h-8 rounded-md px-3 text-sm focus-visible:outline-2">
        Save
      </button>
    </div>
  );
}
