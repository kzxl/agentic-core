import gsap from 'gsap';

export function revealPanel(panel: HTMLElement): void {
  gsap.from(panel, { autoAlpha: 0, y: 8, duration: 0.18 });
}
