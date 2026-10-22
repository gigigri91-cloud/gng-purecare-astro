/**
 * Utilitar partajat pentru animații de numărare fluentă a statisticilor
 */
export function animateCount(el: HTMLElement, target: number, duration = 1500): void {
  const start = performance.now();
  const update = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
    el.textContent = String(Math.round(ease * target));
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

export function initCounterObserver(
  triggerElement: HTMLElement | null,
  counters: NodeListOf<HTMLElement> | HTMLElement[],
  duration = 1500
): void {
  if (!triggerElement || !counters || counters.length === 0) return;
  if (triggerElement.dataset.statsInit === 'true') return;
  triggerElement.dataset.statsInit = 'true';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const runAnimation = () => {
    counters.forEach((el) => {
      const target = Number(el.dataset.count);
      if (Number.isNaN(target)) return;
      el.textContent = '0';
      animateCount(el, target, duration);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      runAnimation();
      observer.disconnect();
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0 }
  );

  observer.observe(triggerElement);
}
