import React, { useState, useMemo } from 'react';
import MiniSpendingPatternsChart from './MiniSpendingPatternsChart';
import MiniSavingsRateTracker from './MiniSavingsRateTracker';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

/**
 * OptimizedAnalyticsSection - A lightweight, responsive analytics container
 * that eliminates nested container issues and prevents height overflow
 */
const OptimizedAnalyticsSection = ({ 
  patternsData = {}, 
  savingsData = null,
  timeRange = '6months',
  onTimeRangeChange = () => {} 
}) => {
  // Debug logging
  console.log('OptimizedAnalyticsSection props:', { patternsData, savingsData, timeRange });
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'patterns', 'savings', 'performance'
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Memoized view configurations to optimize performance
  const viewConfigs = useMemo(() => ({
    overview: {
      title: 'Analytics Overview',
      subtitle: 'Key insights and trends',
      component: 'grid',
      showNavigation: false
    },
    patterns: {
      title: 'Spending Patterns',
      subtitle: 'Monthly trends and analysis',
      component: MiniSpendingPatternsChart,
      props: { patterns: patternsData, compact: false },
      showNavigation: true
    },
    savings: {
      title: 'Savings Progress',
      subtitle: 'Track your savings goals',
      component: MiniSavingsRateTracker,
      props: { timePeriod: timeRange, compact: false },
      showNavigation: true
    },
    performance: {
      title: 'Budget Performance',
      subtitle: 'Performance metrics and achievements',
      component: 'performance',
      showNavigation: true
    }
  }), [patternsData, timeRange]);

  const slides = ['patterns', 'savings', 'performance'];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setActiveView(slides[(currentSlide + 1) % slides.length]);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setActiveView(slides[(currentSlide - 1 + slides.length) % slides.length]);
  };

  const renderMiniComponent = (viewKey) => {
    const config = viewConfigs[viewKey];
    if (!config) return null;

    const Component = config.component;
    
    if (typeof Component === 'string') {
      if (Component === 'grid') {
        return (
          <div className="compact-analytics-grid">
            <div className="compact-analytics-section">
              <div className="section-header-compact">
                <h4>📊 Spending Patterns</h4>
                <button 
                  onClick={() => {
                    setActiveView('patterns');
                    setIsExpanded(true);
                  }}
                  className="expand-section-btn"
                  aria-label="Expand spending patterns"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
              <MiniSpendingPatternsChart patterns={patternsData} compact={true} />
            </div>
            
            <div className="compact-analytics-section">
              <div className="section-header-compact">
                <h4>💰 Savings Rate</h4>
                <button 
                  onClick={() => {
                    setActiveView('savings');
                    setIsExpanded(true);
                  }}
                  className="expand-section-btn"
                  aria-label="Expand savings tracker"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
              <MiniSavingsRateTracker timePeriod={timeRange} compact={true} />
            </div>
            
            <div className="compact-analytics-section">
              <div className="section-header-compact">
                <h4>🎯 Budget Performance</h4>
                <button 
                  onClick={() => {
                    setActiveView('performance');
                    setIsExpanded(true);
                  }}
                  className="expand-section-btn"
                  aria-label="Expand performance metrics"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
              <div className="compact-performance-metrics">
                <div className="compact-metric">
                  <span className="metric-label">Budget</span>
                  <span className="metric-value neutral">25,000 SEK</span>
                </div>
                <div className="compact-metric">
                  <span className="metric-label">Spent</span>
                  <span className="metric-value spent">21,800 SEK</span>
                </div>
                <div className="compact-metric">
                  <span className="metric-label">Saved</span>
                  <span className="metric-value positive">3,200 SEK</span>
                </div>
              </div>
            </div>
          </div>
        );
      } else if (Component === 'performance') {
        return (
          <div className="performance-mini-grid">
            <div className="performance-section">
              <div className="performance-placeholder">
                <h4>Budget Performance Cards</h4>
                <p>Budget vs actual spending analysis</p>
                <div className="placeholder-content">
                  <div className="placeholder-metric">
                    <span className="metric-label">Monthly Budget</span>
                    <span className="metric-value">$2,500</span>
                  </div>
                  <div className="placeholder-metric">
                    <span className="metric-label">Actual Spending</span>
                    <span className="metric-value">$2,180</span>
                  </div>
                  <div className="placeholder-metric">
                    <span className="metric-label">Variance</span>
                    <span className="metric-value positive">+$320</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="performance-section">
              <div className="performance-placeholder">
                <h4>Performance Badges</h4>
                <p>Key achievements and milestones</p>
                <div className="badges-grid">
                  <div className="achievement-badge success">
                    <span className="badge-icon">🎯</span>
                    <span className="badge-text">Budget Goal Met</span>
                  </div>
                  <div className="achievement-badge info">
                    <span className="badge-icon">📊</span>
                    <span className="badge-text">Tracking Active</span>
                  </div>
                  <div className="achievement-badge warning">
                    <span className="badge-icon">⚠️</span>
                    <span className="badge-text">Review Needed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    return <Component {...(config.props || {})} />;
  };

  const renderExpandedView = () => {
    const config = viewConfigs[activeView];
    if (!config) return null;

    return (
      <div className="expanded-analytics-view">
        <div className="expanded-header">
          <div className="expanded-title-section">
            <h3 className="expanded-title">{config.title}</h3>
            <p className="expanded-subtitle">{config.subtitle}</p>
          </div>
          <div className="expanded-controls">
            {config.showNavigation !== false && (
              <div className="slide-navigation">
                <button 
                  onClick={prevSlide}
                  className="nav-btn"
                  aria-label="Previous view"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="slide-indicator">
                  {currentSlide + 1} / {slides.length}
                </span>
                <button 
                  onClick={nextSlide}
                  className="nav-btn"
                  aria-label="Next view"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            <button 
              onClick={() => setIsExpanded(false)}
              className="collapse-btn"
              aria-label="Collapse view"
            >
              <Minimize2 size={16} />
            </button>
          </div>
        </div>
        
        <div className="expanded-content">
          {renderMiniComponent(activeView)}
        </div>
      </div>
    );
  };

  return (
    <div className={`optimized-analytics-section ${isExpanded ? 'expanded' : 'compact'}`}>
      {/* Compact View Header */}
      {!isExpanded && (
        <div className="analytics-header">
          <div className="header-content">
            <h3 className="section-title">Analytics Dashboard</h3>
            <div className="header-controls">
              <select
                value={timeRange}
                onChange={(e) => onTimeRangeChange(e.target.value)}
                className="time-filter-compact"
              >
                <option value="3months">3M</option>
                <option value="6months">6M</option>
                <option value="1year">1Y</option>
              </select>
              <button 
                onClick={() => setIsExpanded(true)}
                className="expand-btn"
                aria-label="Expand analytics"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="analytics-content">
        {isExpanded ? renderExpandedView() : (
          <div className="compact-view">
            {renderMiniComponent('overview')}
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizedAnalyticsSection;
