import { useEffect, useRef, useState } from 'react';

/**
 * useLazyLoad - mounts children only after the container enters viewport.
 * Usage:
 *   const { ref, isVisible } = useLazyLoad({ rootMargin: '200px' });
 *   return <div ref={ref}>{isVisible ? <HeavyChart /> : <Skeleton />}</div>
 */
export default function useLazyLoad(options = { rootMargin: '200px 0px', threshold: 0.01 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If already visible, no need to observe
    if (isVisible) return;
    const el = ref.current;
    if (!el) return;

    // Fallback for older browsers
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      options
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible, options]);

  return { ref, isVisible };
}