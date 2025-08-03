import React from 'react';

// Utility to combine classes
function cx(...cls) {
  return cls.filter(Boolean).join(' ');
}

/**
 * SkeletonBlock - simple shimmering block
 */
export const SkeletonBlock = ({ className = '', style }) => (
  <div
    className={cx(
      'skeleton-block',
      className
    )}
    style={style}
    aria-hidden="true"
  />
);

/**
 * KPI card skeleton
 */
export const SkeletonKpiCard = () => (
  <div className="card" style={{ padding: '1rem' }}>
    <SkeletonBlock className="h-4 w-24 mb-2" />
    <SkeletonBlock className="h-6 w-36 mb-2" />
    <SkeletonBlock className="h-3 w-20" />
  </div>
);

/**
 * Chart skeleton
 */
export const SkeletonChart = () => (
  <div className="card" style={{ padding: '1rem', height: 300 }}>
    <SkeletonBlock className="h-4 w-32 mb-4" />
    <SkeletonBlock className="h-full w-full" />
  </div>
);

/**
 * Table row skeleton
 */
export const SkeletonTableRows = ({ rows = 6 }) => (
  <div className="table-card">
    <div className="table-header">
      <div style={{ display: 'flex', gap: '1rem' }}>
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-4 w-16" />
        <SkeletonBlock className="h-4 w-20" />
      </div>
    </div>
    <div className="table-body">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="table-row" style={{ padding: '0.75rem 1rem' }}>
          <SkeletonBlock className="h-4 w-1/3 mb-2" />
          <SkeletonBlock className="h-3 w-1/5" />
        </div>
      ))}
    </div>
  </div>
);

// Minimal CSS (scoped via global utilities in touch.css / design-system.css)
// Add skeleton shimmer using a gradient
// Consumers already import index.css globally, so we rely on these utility classes being present.