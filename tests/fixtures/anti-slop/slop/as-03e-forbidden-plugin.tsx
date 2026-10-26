import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export function ReportHeader() {
  const headerRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    const motion = gsap.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.create({ trigger: headerRef.current, pin: true, scrub: true });
    });
  });

  return <h1 ref={headerRef}>Monthly report</h1>;
}
