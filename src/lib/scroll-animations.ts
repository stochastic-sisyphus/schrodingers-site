/**
 * Scroll-based animations using Intersection Observer
 * Progressive enhancement - works without JS, enhanced with it
 */

export interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  once?: boolean;
}

const DEFAULT_OPTIONS: ScrollAnimationOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px',
  delay: 0,
  once: true,
};

/**
 * Initialize scroll animations for content zones
 * Uses Intersection Observer for 60fps performance
 */
export function initScrollAnimations(
  selector: string = '.content-zone',
  options: ScrollAnimationOptions = {}
): void {
  // Early return if no IntersectionObserver support
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const elements = document.querySelectorAll<HTMLElement>(selector);

  if (elements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const delay = target.dataset.delay || mergedOptions.delay;

          // Apply animation class after delay
          setTimeout(() => {
            target.classList.add('is-visible');
          }, Number(delay));

          // Unobserve if animation should only happen once
          if (mergedOptions.once) {
            observer.unobserve(target);
          }
        } else if (!mergedOptions.once) {
          // Remove class if animation should repeat
          entry.target.classList.remove('is-visible');
        }
      });
    },
    {
      threshold: mergedOptions.threshold,
      rootMargin: mergedOptions.rootMargin,
    }
  );

  // Observe all elements
  elements.forEach((element) => observer.observe(element));
}

/**
 * Initialize staggered animations for child elements
 * Useful for grids where items should animate sequentially
 */
export function initStaggeredAnimations(
  containerSelector: string,
  itemSelector: string,
  staggerDelay: number = 100
): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }

  const containers = document.querySelectorAll<HTMLElement>(containerSelector);

  containers.forEach((container) => {
    const items = container.querySelectorAll<HTMLElement>(itemSelector);

    items.forEach((item, index) => {
      item.dataset.delay = String(index * staggerDelay);
    });
  });

  // Initialize standard scroll animations on items
  initScrollAnimations(itemSelector, {
    threshold: 0.05,
    rootMargin: '0px 0px -50px 0px',
  });
}

/**
 * Subtle parallax effect for background layers
 * Optimized using requestAnimationFrame and will-change
 */
export function initParallaxScroll(selector: string = '.parallax-layer'): void {
  if (typeof window === 'undefined') return;

  const layers = document.querySelectorAll<HTMLElement>(selector);
  if (layers.length === 0) return;

  let ticking = false;
  let scrollY = window.scrollY;

  function updateParallax() {
    layers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.speed || '0.5');
      const yPos = scrollY * speed;
      layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  window.addEventListener(
    'scroll',
    () => {
      scrollY = window.scrollY;
      requestTick();
    },
    { passive: true }
  );

  // Initial update
  updateParallax();
}

/**
 * Initialize all scroll animations when DOM is ready
 */
export function initAllScrollAnimations(): void {
  if (typeof window === 'undefined') return;

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Fade in content zones
    initScrollAnimations('.content-zone', {
      threshold: 0.15,
      rootMargin: '0px 0px -80px 0px',
    });

    // Stagger animation for project/blog/research grids
    initStaggeredAnimations('.content-grid', '.grid-item', 80);

    // Optional parallax for atmosphere (if enabled)
    const parallaxEnabled = document.querySelector('[data-parallax]');
    if (parallaxEnabled) {
      initParallaxScroll();
    }
  }
}
