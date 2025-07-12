-- Migration: Add budget optimization tables
-- Created: 2025-07-12

-- Table for storing optimization tips
CREATE TABLE budget_optimization_tips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  tip_type TEXT NOT NULL, -- 'reallocation', 'reduction', 'seasonal', 'goal_based'
  category TEXT, -- affected category
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_amount REAL, -- potential savings
  confidence_score REAL, -- 0-1 confidence in recommendation
  is_dismissed BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table for tracking spending patterns
CREATE TABLE spending_patterns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  month TEXT NOT NULL, -- 'YYYY-MM'
  average_amount REAL NOT NULL,
  variance REAL NOT NULL,
  trend_direction TEXT, -- 'increasing', 'decreasing', 'stable'
  seasonal_factor REAL DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_budget_optimization_tips_user_id ON budget_optimization_tips(user_id);
CREATE INDEX idx_budget_optimization_tips_type ON budget_optimization_tips(tip_type);
CREATE INDEX idx_budget_optimization_tips_created_at ON budget_optimization_tips(created_at);
CREATE INDEX idx_spending_patterns_user_id ON spending_patterns(user_id);
CREATE INDEX idx_spending_patterns_category ON spending_patterns(category);
CREATE INDEX idx_spending_patterns_month ON spending_patterns(month);
