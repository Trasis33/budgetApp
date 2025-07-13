const BudgetOptimizer = require('./server/utils/budgetOptimizer');

// Test the enhanced trend strength calculation
function testEnhancedTrend() {
  console.log('Testing Enhanced Trend Strength Calculation...\n');
  
  const optimizer = new BudgetOptimizer(1); // Mock user ID
  
  // Test case 1: Stable trend (small variation)
  const stableAmounts = [1000, 1020, 980, 1010, 990, 1005];
  const stableRawTrend = optimizer.calculateTrend(stableAmounts);
  const stableAnalysis = optimizer.calculateEnhancedTrendStrength(stableAmounts, stableRawTrend);
  
  console.log('=== Stable Trend Test ===');
  console.log('Data:', stableAmounts);
  console.log('Raw trend:', stableRawTrend);
  console.log('Enhanced analysis:', stableAnalysis);
  console.log('');
  
  // Test case 2: Moderate increasing trend
  const moderateAmounts = [1000, 1100, 1200, 1250, 1300, 1350];
  const moderateRawTrend = optimizer.calculateTrend(moderateAmounts);
  const moderateAnalysis = optimizer.calculateEnhancedTrendStrength(moderateAmounts, moderateRawTrend);
  
  console.log('=== Moderate Increasing Trend Test ===');
  console.log('Data:', moderateAmounts);
  console.log('Raw trend:', moderateRawTrend);
  console.log('Enhanced analysis:', moderateAnalysis);
  console.log('');
  
  // Test case 3: Strong increasing trend (like the problematic cases)
  const strongAmounts = [1000, 1500, 2000, 2500, 3000, 3500];
  const strongRawTrend = optimizer.calculateTrend(strongAmounts);
  const strongAnalysis = optimizer.calculateEnhancedTrendStrength(strongAmounts, strongRawTrend);
  
  console.log('=== Strong Increasing Trend Test ===');
  console.log('Data:', strongAmounts);
  console.log('Raw trend:', strongRawTrend);
  console.log('Enhanced analysis:', strongAnalysis);
  console.log('');
  
  // Test case 4: Very volatile data
  const volatileAmounts = [1000, 500, 1500, 300, 1800, 200];
  const volatileRawTrend = optimizer.calculateTrend(volatileAmounts);
  const volatileAnalysis = optimizer.calculateEnhancedTrendStrength(volatileAmounts, volatileRawTrend);
  
  console.log('=== Volatile Trend Test ===');
  console.log('Data:', volatileAmounts);
  console.log('Raw trend:', volatileRawTrend);
  console.log('Enhanced analysis:', volatileAnalysis);
  console.log('');
  
  // Test case 5: Insufficient data
  const insufficientAmounts = [1000];
  const insufficientRawTrend = optimizer.calculateTrend(insufficientAmounts);
  const insufficientAnalysis = optimizer.calculateEnhancedTrendStrength(insufficientAmounts, insufficientRawTrend);
  
  console.log('=== Insufficient Data Test ===');
  console.log('Data:', insufficientAmounts);
  console.log('Raw trend:', insufficientRawTrend);
  console.log('Enhanced analysis:', insufficientAnalysis);
  console.log('');
}

testEnhancedTrend();
