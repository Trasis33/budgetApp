import React, { useState, useId } from 'react';

const isReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ExpandableCard = ({ title, defaultExpanded = false, children, className = '' }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const contentId = useId();

  return (
    <div className={['card', 'expandable-card', className].join(' ')}>
      <div className="card-header flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
        <h3 className="section-title">{title}</h3>
        <button
          type="button"
          className="btn btn-secondary"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((v) => !v)}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
            <span>{expanded ? 'Less' : 'More'}</span>
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                transition: isReducedMotion() ? 'none' : 'transform 200ms ease',
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              ▼
            </span>
          </span>
        </button>
      </div>

      <div
        id={contentId}
        className="expandable-content"
        style={{
          overflow: 'hidden',
          transition: isReducedMotion() ? 'none' : 'max-height 250ms ease',
          maxHeight: expanded ? '2000px' : '0px',
        }}
      >
        <div style={{ paddingTop: '0.5rem' }}>{children}</div>
      </div>
    </div>
  );
};

export default ExpandableCard;