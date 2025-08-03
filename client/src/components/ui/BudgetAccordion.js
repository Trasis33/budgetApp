import React, { useState, useMemo, useId } from 'react';

function usePersistentExpanded(key, initial = false) {
  const [expanded, setExpanded] = useState(() => {
    try {
      const v = localStorage.getItem(key);
      return v === null ? initial : v === '1';
    } catch {
      return initial;
    }
  });
  const set = (v) => {
    const next = typeof v === 'function' ? v(expanded) : v;
    try {
      localStorage.setItem(key, next ? '1' : '0');
    } catch {}
    setExpanded(next);
  };
  return [expanded, set];
}

/**
 * BudgetAccordion
 * props:
 * - sections: [{ id, title, spent, budget, children: ReactNode }]
 * - defaultExpandedIds?: string[]
 * - mobileCollapsed?: boolean (default true)
 */
const BudgetAccordion = ({
  sections = [],
  defaultExpandedIds = [],
  mobileCollapsed = true,
}) => {
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches;

  const computedDefaults = useMemo(() => {
    if (isMobile && mobileCollapsed) return new Set(defaultExpandedIds);
    // Desktop default: expand first section if none provided
    return new Set(defaultExpandedIds.length ? defaultExpandedIds : sections[0] ? [sections[0].id] : []);
  }, [defaultExpandedIds, sections, isMobile, mobileCollapsed]);

  return (
    <div className="budget-accordion">
      {sections.map((sec) => (
        <AccordionItem
          key={sec.id}
          id={sec.id}
          title={sec.title}
          spent={sec.spent}
          budget={sec.budget}
          defaultExpanded={computedDefaults.has(sec.id)}
        >
          {sec.children}
        </AccordionItem>
      ))}
    </div>
  );
};

const AccordionItem = ({ id, title, spent = 0, budget = 0, defaultExpanded = false, children }) => {
  const contentId = useId();
  const [expanded, setExpanded] = usePersistentExpanded(`accordion:${id}`, defaultExpanded);

  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const statusColor =
    pct < 80 ? '#10b981' : pct < 100 ? '#f59e0b' : '#ef4444';

  return (
    <div className="card hover-lift" style={{ marginBottom: '0.75rem' }}>
      <button
        type="button"
        className="btn-ghost"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="section-title" style={{ WebkitTextFillColor: 'initial' }}>{title}</span>
          <span className="badge" style={{ background: 'rgba(0,0,0,0.04)' }}>
            {pct}% used
          </span>
        </div>
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
          }}
        >
          ▼
        </span>
      </button>

      <div style={{ padding: '0 1rem 0.75rem' }}>
        <div className="progress-bar" style={{ height: '10px', background: 'rgba(203, 213, 225, 0.3)' }}>
          <div
            className="progress-fill"
            style={{
              width: `${pct}%`,
              background: statusColor,
              transition: 'width 250ms ease',
            }}
          />
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
          {spent.toLocaleString()} / {budget.toLocaleString()}
        </div>
      </div>

      <div
        id={contentId}
        style={{
          overflow: 'hidden',
          maxHeight: expanded ? '2000px' : '0px',
          transition: 'max-height 250ms ease',
        }}
      >
        <div style={{ padding: '0 1rem 0.75rem' }}>{children}</div>
      </div>
    </div>
  );
};

export default BudgetAccordion;