const BudgetOptimizer = require('./utils/budgetOptimizer');
const knex = require('./db/database');

async function testOptimization() {
  try {
    console.log('Testing BudgetOptimizer...');
    
    // Test with user ID 1 (from the JWT token in the error)
    const optimizer = new BudgetOptimizer(1);
    
    console.log('Getting expense history...');
    const expenses = await optimizer.getExpenseHistory(12);
    console.log('Expenses:', expenses);
    
    console.log('Getting budget history...');
    const budgets = await optimizer.getBudgetHistory(12);
    console.log('Budgets:', budgets);
    
    console.log('Getting savings goals...');
    const savingsGoals = await optimizer.getSavingsGoals();
    console.log('Savings goals:', savingsGoals);
    
    console.log('Analyzing spending patterns...');
    const analysis = await optimizer.analyzeSpendingPatterns();
    console.log('Analysis result:', JSON.stringify(analysis, null, 2));
    
  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    process.exit(0);
  }
}

testOptimization();
