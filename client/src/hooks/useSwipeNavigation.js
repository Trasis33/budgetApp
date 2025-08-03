import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Lightweight swipe navigation for mobile.
 * - Swipe Left: go to next route in sequence
 * - Swipe Right: go to previous route in sequence
 * Only active on screens <= 768px.
 */
export default function useSwipeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return;

    const threshold = 50; // min px to qualify as swipe
    const restraint = 80; // max Y delta allowed
    const allowedTime = 500; // ms
    let startTime = 0;

    const onTouchStart = (e) => {
      const t = e.changedTouches[0];
      touchStartX.current = t.pageX;
      touchStartY.current = t.pageY;
      startTime = new Date().getTime();
    };

    const onTouchEnd = (e) => {
      const t = e.changedTouches[0];
      touchEndX.current = t.pageX;
      touchEndY.current = t.pageY;

      const distX = touchEndX.current - touchStartX.current;
      const distY = touchEndY.current - touchStartY.current;
      const elapsed = new Date().getTime() - startTime;

      if (elapsed <= allowedTime && Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
        if (distX < 0) {
          // swipe left - next
          navigate(nextRoute(location.pathname));
        } else {
          // swipe right - prev
          navigate(prevRoute(location.pathname));
        }
      }
    };

    // attach on main content area if exists, else document
    const target = document.querySelector('.main-content') || document;
    target.addEventListener('touchstart', onTouchStart, { passive: true });
    target.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      target.removeEventListener('touchstart', onTouchStart);
      target.removeEventListener('touchend', onTouchEnd);
    };
  }, [navigate, location.pathname]);
}

const ROUTE_SEQUENCE = ['/', '/expenses', '/budget', '/settings'];

function nextRoute(current) {
  const idx = ROUTE_SEQUENCE.findIndex((r) => current === r || (r !== '/' && current.startsWith(r)));
  const nextIdx = idx === -1 ? 0 : (idx + 1) % ROUTE_SEQUENCE.length;
  return ROUTE_SEQUENCE[nextIdx];
}

function prevRoute(current) {
  const idx = ROUTE_SEQUENCE.findIndex((r) => current === r || (r !== '/' && current.startsWith(r)));
  const prevIdx = idx === -1 ? 0 : (idx - 1 + ROUTE_SEQUENCE.length) % ROUTE_SEQUENCE.length;
  return ROUTE_SEQUENCE[prevIdx];
}