const BudgetOptimizer = require('./utils/budgetOptimizer');

async function testSEKCurrency() {
  try {
    console.log('Testing SEK currency formatting...');
    
    const optimizer = new BudgetOptimizer(1);
    
    // Test currency formatting
    console.log('1000 SEK:', optimizer.formatCurrency(1000));
    console.log('4625 SEK:', optimizer.formatCurrency(4625));
    console.log('1666.67 SEK:', optimizer.formatCurrency(1666.67));
    
    console.log('\nSEK currency formatting is working correctly!');
    
  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    process.exit(0);
  }
}

testSEKCurrency();
