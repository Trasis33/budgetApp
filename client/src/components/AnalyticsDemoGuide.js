import React from 'react';

/**
 * AnalyticsDemoGuide - Explains what users should see in the analytics section
 */
const AnalyticsDemoGuide = () => {
  return (
    <div className="demo-guide">
      <div className="demo-guide-header">
        <h3>📊 Analytics Dashboard Demo</h3>
        <p>This section demonstrates the optimized analytics components with sample data</p>
      </div>
      
      <div className="demo-features">
        <div className="demo-feature">
          <div className="feature-icon">📈</div>
          <div className="feature-content">
            <h4>Spending Patterns</h4>
            <p>Interactive charts showing spending trends across categories like Food & Dining, Transportation, and Entertainment with trend indicators (📈 increasing, ➡️ stable, 📉 decreasing)</p>
          </div>
        </div>
        
        <div className="demo-feature">
          <div className="feature-icon">💰</div>
          <div className="feature-content">
            <h4>Savings Rate Tracker</h4>
            <p>Displays savings metrics including average rate (18.5%), total savings ($2,850), and trend direction with monthly progression charts</p>
          </div>
        </div>
        
        <div className="demo-feature">
          <div className="feature-icon">🎯</div>
          <div className="feature-content">
            <h4>Budget Performance</h4>
            <p>Shows budget vs actual spending metrics, variance calculations, and achievement badges for goal tracking and performance monitoring</p>
          </div>
        </div>
      </div>
      
      <div className="demo-instructions">
        <h4>How to Use:</h4>
        <ul>
          <li><strong>Compact View:</strong> Click on any preview card to expand that section</li>
          <li><strong>Expanded View:</strong> Use ← → navigation buttons to switch between sections</li>
          <li><strong>Time Range:</strong> Select 3M, 6M, or 1Y to adjust the data timeframe</li>
          <li><strong>Minimize:</strong> Click the minimize button to return to compact view</li>
        </ul>
      </div>
      
      <div className="demo-note">
        <strong>Note:</strong> This demo uses sample data to showcase the component functionality. 
        In a production environment, this would connect to your actual financial data.
      </div>
    </div>
  );
};

export default AnalyticsDemoGuide;
